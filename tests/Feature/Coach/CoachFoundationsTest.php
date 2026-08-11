<?php

namespace Tests\Feature\Coach;

use App\Coach\AI\AIProviderInterface;
use App\Coach\Services\CoachSettingsService;
use App\Coach\AI\FakeAIProvider;
use App\Coach\DTO\AIRequest;
use App\Coach\DTO\AIResponse;
use App\Coach\DTO\StructuredAIResponse;
use App\Models\CoachConversation;
use App\Models\CoachUsage;
use App\Models\ProfessionalProfile;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CoachFoundationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    public function test_profile_can_be_saved_and_remains_owned_by_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->put(route('coach.profile.update'), [
            'professional_title' => 'Product Manager',
            'summary' => 'Mon parcours',
            'career_objective' => 'Direction produit',
            'default_language' => 'fr',
            'target_roles' => ['Head of Product'],
            'target_sectors' => ['SaaS'],
            'languages' => ['fr', 'en'],
        ])->assertRedirect();

        $this->assertDatabaseHas('professional_profiles', [
            'user_id' => $user->id,
            'professional_title' => 'Product Manager',
        ]);
    }

    public function test_coach_has_a_dedicated_client_dashboard_route(): void
    {
        $this->assertTrue(app('router')->has('coach.dashboard'));
    }

    public function test_document_is_private_and_another_user_cannot_download_it(): void
    {
        Storage::fake('coach_private');
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $upload = UploadedFile::fake()->createWithContent('cv.txt', 'Contenu prive');

        $this->actingAs($owner)->post(route('coach.documents.store'), [
            'type' => 'cv',
            'language' => 'fr',
            'document' => $upload,
        ])->assertRedirect();

        $document = UserDocument::firstOrFail();
        Storage::disk('coach_private')->assertExists($document->path);
        $this->assertNotSame('cv.txt', $document->path);
        $this->actingAs($other)->get(route('coach.documents.download', $document))->assertNotFound();
    }

    public function test_conversation_and_fake_ai_message_are_persisted_with_usage(): void
    {
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();

        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Aide-moi a definir mon objectif.',
        ])->assertRedirect();

        $this->assertDatabaseHas('coach_messages', ['coach_conversation_id' => $conversation->id, 'role' => 'user']);
        $this->assertDatabaseHas('coach_messages', ['coach_conversation_id' => $conversation->id, 'role' => 'assistant']);
        $this->assertDatabaseHas('coach_usages', ['user_id' => $user->id, 'status' => 'success']);
    }

    public function test_quota_blocks_a_new_ai_call(): void
    {
        app(CoachSettingsService::class)->update(['monthly_message_limit' => 1]);
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();
        CoachUsage::factory()->for($user)->for($conversation)->create();

        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Un nouveau message',
        ])->assertStatus(429);
    }

    public function test_provider_failure_is_controlled_and_audited(): void
    {
        $this->app->instance(AIProviderInterface::class, new FakeAIProvider('error'));
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();

        $this->actingAs($user)->from(route('coach.conversations.show', $conversation))
            ->post(route('coach.conversations.messages.store', $conversation), ['content' => 'Bonjour'])
            ->assertRedirect(route('coach.conversations.show', $conversation))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('coach_usages', ['user_id' => $user->id, 'status' => 'failed']);
    }

    public function test_foreign_document_ids_never_enter_ai_context(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        ProfessionalProfile::factory()->for($owner)->create(['professional_title' => 'SECRET_PROFILE']);
        $foreign = UserDocument::factory()->for($owner)->create(['original_name' => 'SECRET_DOCUMENT.pdf']);
        $conversation = CoachConversation::factory()->for($attacker)->create();

        $spy = new class implements AIProviderInterface {
            public ?AIRequest $request = null;
            public function generateText(AIRequest $request): AIResponse { throw new \LogicException(); }
            public function generateStructured(AIRequest $request, array $schema): StructuredAIResponse
            {
                $this->request = $request;
                return new StructuredAIResponse(['summary' => 'OK', 'next_actions' => []], 1, 1, 'spy', 1);
            }
        };
        $this->app->instance(AIProviderInterface::class, $spy);

        $this->actingAs($attacker)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Analyse',
            'document_ids' => [$foreign->id],
        ])->assertRedirect();

        $this->assertNotNull($spy->request);
        $this->assertStringNotContainsString('SECRET_PROFILE', $spy->request->systemContext);
        $this->assertStringNotContainsString('SECRET_DOCUMENT', $spy->request->systemContext);
    }
}
