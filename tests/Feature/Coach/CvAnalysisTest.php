<?php

namespace Tests\Feature\Coach;

use App\Coach\AI\AIProviderInterface;
use App\Coach\AI\FakeAIProvider;
use App\Coach\Services\CoachSettingsService;
use App\Coach\Services\CvCoachService;
use App\Http\Middleware\OnlyTestUsers;
use App\Models\CoachAnalysis;
use App\Models\CoachUsage;
use App\Models\ProfessionalProfile;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CvAnalysisTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
        Cache::forget('coach_settings');
        app(CoachSettingsService::class)->update([
            'enabled' => true, 'module_cv' => true, 'monthly_message_limit' => 100,
            'rate_limit_per_minute' => 100, 'languages' => ['fr', 'de', 'en'],
        ]);
    }

    public function test_owner_can_create_full_cv_analysis_without_profile(): void
    {
        [$user, $cv, $offer] = $this->documents();

        $this->actingAs($user)->post(route('coach.cv.store'), $this->payload($cv, $offer))->assertRedirect();

        $analysis = CoachAnalysis::firstOrFail();
        $this->assertNull($user->professionalProfile);
        $this->assertSame('completed', $analysis->status);
        $this->assertSame('moderate', $analysis->result['comparison']['match_level']);
        $this->assertNotEmpty($analysis->result['comparison']['strengths']);
        $this->assertNotEmpty($analysis->result['comparison']['missing_or_weak_skills']);
        $this->assertNotEmpty($analysis->result['comparison']['important_keywords']);
        $this->assertNotEmpty($analysis->result['improvement']['general_advice']);
        $this->assertStringContainsString('BROUILLON', $analysis->result['adapted']['adapted_cv_draft']);
        $this->assertNotEmpty($analysis->result['letter']['cover_letter']);
        $this->assertNotEmpty($analysis->result['message']['application_message']);
        $this->assertSame('cv', $analysis->conversation->module);
        $this->assertSame(5, CoachUsage::where('user_id', $user->id)->where('status', 'success')->count());
        foreach (['cv.compare', 'cv.improve', 'cv.adapt', 'cv.cover_letter', 'cv.application_message'] as $operation) {
            $this->assertDatabaseHas('coach_usages', ['user_id' => $user->id, 'operation' => $operation, 'prompt_version' => '1.0']);
        }
    }

    public function test_foreign_cv_and_offer_are_rejected_before_provider_call(): void
    {
        [$owner, $cv, $offer] = $this->documents();
        [$other, $foreignCv, $foreignOffer] = $this->documents();

        $this->actingAs($owner)->post(route('coach.cv.store'), $this->payload($foreignCv, $offer))->assertNotFound();
        $this->actingAs($owner)->post(route('coach.cv.store'), $this->payload($cv, $foreignOffer))->assertNotFound();

        $this->assertSame(0, CoachUsage::count());
        $this->assertSame(0, CoachAnalysis::count());
        $this->assertNotSame($owner->id, $other->id);
    }

    public function test_history_and_private_analysis_are_owner_scoped_even_for_admin(): void
    {
        [$owner, $cv, $offer] = $this->documents();
        $analysis = app(CvCoachService::class)->analyze($owner, $this->payload($cv, $offer));
        $other = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($owner)->get(route('coach.cv.index'))->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('Frontend/Coach/Cv/Index')->has('analyses.data', 1),
        );
        $this->actingAs($owner)->get(route('coach.cv.show', $analysis))->assertOk();
        $this->actingAs($other)->get(route('coach.cv.show', $analysis))->assertNotFound();
        $this->actingAs($admin)->get(route('coach.cv.show', $analysis))->assertNotFound();
    }

    public function test_creation_is_idempotent_for_same_user_and_submission_token(): void
    {
        [$user, $cv, $offer] = $this->documents();
        $payload = $this->payload($cv, $offer);
        $service = app(CvCoachService::class);

        $first = $service->analyze($user, $payload);
        $usageCount = CoachUsage::count();
        $second = $service->analyze($user, $payload);

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, CoachAnalysis::count());
        $this->assertSame(1, $user->coachConversations()->where('module', 'cv')->count());
        $this->assertSame($usageCount, CoachUsage::count());
    }

    public function test_disabled_module_and_quota_block_cv_provider_operations(): void
    {
        [$user, $cv, $offer] = $this->documents();
        app(CoachSettingsService::class)->update(['module_cv' => false]);
        $this->actingAs($user)->get(route('coach.cv.index'))->assertForbidden();
        $this->actingAs($user)->post(route('coach.cv.store'), $this->payload($cv, $offer))->assertForbidden();
        $this->assertSame(0, CoachUsage::count());

        app(CoachSettingsService::class)->update(['module_cv' => true, 'monthly_message_limit' => 1]);
        CoachUsage::factory()->for($user)->create(['coach_conversation_id' => null]);
        $this->actingAs($user)->post(route('coach.cv.store'), $this->payload($cv, $offer))->assertTooManyRequests();
        $this->assertDatabaseMissing('coach_analyses', ['status' => 'completed']);
    }

    public function test_missing_documents_and_wrong_document_types_are_rejected(): void
    {
        [$user, $cv, $offer] = $this->documents();
        $this->actingAs($user)->post(route('coach.cv.store'), array_diff_key($this->payload($cv, $offer), ['cv_document_id' => true]))->assertSessionHasErrors('cv_document_id');
        $this->actingAs($user)->post(route('coach.cv.store'), array_diff_key($this->payload($cv, $offer), ['job_document_id' => true]))->assertSessionHasErrors('job_document_id');
        $wrong = UserDocument::factory()->for($user)->create(['type' => 'certificate']);
        $this->actingAs($user)->post(route('coach.cv.store'), $this->payload($wrong, $offer))->assertNotFound();
    }

    public function test_provider_error_and_invalid_structure_never_complete_analysis(): void
    {
        [$user, $cv, $offer] = $this->documents();
        $this->app->instance(AIProviderInterface::class, new FakeAIProvider('error'));
        $this->actingAs($user)->post(route('coach.cv.store'), $this->payload($cv, $offer))->assertRedirect()->assertSessionHas('error');
        $this->assertDatabaseHas('coach_analyses', ['user_id' => $user->id, 'status' => 'failed']);

        $this->app->instance(AIProviderInterface::class, new FakeAIProvider('invalid'));
        $this->actingAs($user)->post(route('coach.cv.store'), $this->payload($cv, $offer))->assertRedirect()->assertSessionHas('error');
        $this->assertSame(0, CoachAnalysis::where('status', 'completed')->count());
        $this->assertSame(2, CoachAnalysis::where('status', 'failed')->count());
    }

    public function test_context_separates_verified_facts_from_coach_suggestions(): void
    {
        [$user, $cv, $offer] = $this->documents();
        ProfessionalProfile::factory()->for($user)->create(['professional_title' => 'Comptable', 'target_roles' => ['Finance']]);
        $analysis = CoachAnalysis::factory()->for($user)->create([
            'coach_conversation_id' => $user->coachConversations()->create(['module' => 'cv', 'title' => 'Test', 'language' => 'fr', 'status' => 'active'])->id,
            'cv_document_id' => $cv->id, 'job_document_id' => $offer->id,
        ]);

        $context = app(CvCoachService::class)->factsContext($user, $analysis, $cv, $offer);

        $this->assertSame('Comptable', $context['professional_profile_data']['professional_title']);
        $this->assertStringContainsString('Only', $context['context_semantics']['user_facts']);
        $this->assertStringContainsString('suggestion', $context['context_semantics']['coach_suggestions']);
        $this->assertStringContainsString('No extracted document text', $context['context_semantics']['document_limitation']);
        $this->assertArrayNotHasKey('suggested_skills', $context['professional_profile_data']);
        $this->assertDatabaseMissing('professional_profiles', ['user_id' => $user->id, 'professional_title' => 'Product Manager']);
    }

    private function documents(): array
    {
        $user = User::factory()->create();
        $cv = UserDocument::factory()->for($user)->create(['type' => 'cv', 'original_name' => 'cv.pdf']);
        $offer = UserDocument::factory()->for($user)->create(['type' => 'job_offer', 'original_name' => 'offre.pdf']);
        return [$user, $cv, $offer];
    }

    private function payload(UserDocument $cv, UserDocument $offer, array $overrides = []): array
    {
        return array_merge([
            'cv_document_id' => $cv->id, 'job_document_id' => $offer->id,
            'job_title' => 'Product Manager', 'company_name' => 'Redeemer Holding',
            'language' => 'fr', 'submission_token' => (string) Str::uuid(),
        ], $overrides);
    }
}
