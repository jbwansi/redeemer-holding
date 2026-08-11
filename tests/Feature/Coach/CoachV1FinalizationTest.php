<?php

namespace Tests\Feature\Coach;

use App\Coach\Services\CoachDataExportService;
use App\Coach\Services\CoachDataPurgeService;
use App\Coach\Services\CoachSettingsService;
use App\Http\Middleware\OnlyTestUsers;
use App\Models\CoachAnalysis;
use App\Models\CoachConversation;
use App\Models\CoachUsage;
use App\Models\ProfessionalProfile;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CoachV1FinalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
        Cache::forget('coach_settings');
        app(CoachSettingsService::class)->update([
            'enabled' => true,
            'module_career' => true,
            'monthly_message_limit' => 100,
            'rate_limit_per_minute' => 100,
        ]);
    }

    public function test_export_is_scoped_and_excludes_private_storage_metadata(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        ProfessionalProfile::factory()->for($owner)->create(['professional_title' => 'Architecte']);
        $document = UserDocument::factory()->for($owner)->create(['path' => 'private/secret.pdf']);
        UserDocument::factory()->for($other)->create(['original_name' => 'foreign.pdf']);
        $conversation = CoachConversation::factory()->for($owner)->create();
        $conversation->messages()->create(['role' => 'user', 'content' => 'Mon contenu']);

        $export = app(CoachDataExportService::class)->export($owner);
        $encoded = json_encode($export, JSON_THROW_ON_ERROR);

        $this->assertSame($owner->id, $export['user_id']);
        $this->assertSame($document->id, $export['documents'][0]['id']);
        $this->assertStringNotContainsString('private/secret.pdf', $encoded);
        $this->assertStringNotContainsString('foreign.pdf', $encoded);
        $this->assertStringContainsString('Mon contenu', $encoded);
    }

    public function test_purge_removes_only_coach_data_and_physical_files(): void
    {
        Storage::fake('coach_private');
        $owner = User::factory()->create();
        $other = User::factory()->create();
        ProfessionalProfile::factory()->for($owner)->create();
        $document = UserDocument::factory()->for($owner)->create(['path' => 'owner.pdf']);
        $otherDocument = UserDocument::factory()->for($other)->create(['path' => 'other.pdf']);
        Storage::disk('coach_private')->put($document->path, 'owner');
        Storage::disk('coach_private')->put($otherDocument->path, 'other');
        $conversation = CoachConversation::factory()->for($owner)->create();
        CoachUsage::factory()->for($owner)->for($conversation)->create();
        CoachAnalysis::factory()->create([
            'user_id' => $owner->id,
            'coach_conversation_id' => $conversation->id,
            'cv_document_id' => $document->id,
            'job_document_id' => null,
        ]);

        app(CoachDataPurgeService::class)->purge($owner);

        $this->assertDatabaseHas('users', ['id' => $owner->id]);
        $this->assertDatabaseMissing('user_documents', ['id' => $document->id]);
        $this->assertDatabaseMissing('coach_conversations', ['id' => $conversation->id]);
        $this->assertDatabaseMissing('professional_profiles', ['user_id' => $owner->id]);
        $this->assertDatabaseHas('user_documents', ['id' => $otherDocument->id]);
        Storage::disk('coach_private')->assertMissing($document->path);
        Storage::disk('coach_private')->assertExists($otherDocument->path);
    }

    public function test_referenced_document_cannot_be_deleted_or_lost(): void
    {
        Storage::fake('coach_private');
        $user = User::factory()->create();
        $document = UserDocument::factory()->for($user)->create(['path' => 'referenced.pdf']);
        Storage::disk('coach_private')->put($document->path, 'content');
        CoachAnalysis::factory()->create([
            'user_id' => $user->id,
            'cv_document_id' => $document->id,
            'job_document_id' => null,
        ]);

        $this->actingAs($user)->delete(route('coach.documents.destroy', $document))->assertConflict();

        $this->assertDatabaseHas('user_documents', ['id' => $document->id]);
        Storage::disk('coach_private')->assertExists($document->path);
    }

    public function test_career_history_is_paginated_and_owner_scoped(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        foreach (range(1, 21) as $number) {
            $owner->careerGoals()->create([
                'title' => "Objectif {$number}",
                'language' => 'fr',
                'submission_token' => (string) Str::uuid(),
            ]);
        }
        $other->careerGoals()->create([
            'title' => 'Objectif confidentiel',
            'language' => 'fr',
            'submission_token' => (string) Str::uuid(),
        ]);

        $this->actingAs($owner)->get(route('coach.career.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/Coach/Career/Index')
                ->has('goals.data', 20)
                ->where('goals.total', 21)
                ->where('goals.last_page', 2));
    }
}
