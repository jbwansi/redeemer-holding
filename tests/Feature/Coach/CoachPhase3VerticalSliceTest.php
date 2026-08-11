<?php

namespace Tests\Feature\Coach;

use App\Coach\AI\AIProviderInterface;
use App\Coach\DTO\AIRequest;
use App\Coach\DTO\AIResponse;
use App\Coach\DTO\StructuredAIResponse;
use App\Coach\Services\CoachSettingsService;
use App\Http\Middleware\OnlyTestUsers;
use App\Models\CoachConversation;
use App\Models\CoachMessage;
use App\Models\ProfessionalProfile;
use App\Models\User;
use App\Models\UserDocument;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CoachPhase3VerticalSliceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
        Cache::forget('coach_settings');
    }

    public function test_owner_can_create_view_and_archive_a_general_conversation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('coach.conversations.store'), [
            'title' => 'Objectif professionnel',
            'language' => 'de',
            'module' => 'general',
        ]);
        $conversation = CoachConversation::firstOrFail();

        $response->assertRedirect(route('coach.conversations.show', $conversation));
        $this->actingAs($user)->get(route('coach.conversations.show', $conversation))->assertOk();
        $this->actingAs($user)->patch(route('coach.conversations.archive', $conversation))->assertRedirect();
        $this->assertSame('archived', $conversation->fresh()->status);
    }

    public function test_foreign_conversation_is_never_accessible(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $conversation = CoachConversation::factory()->for($owner)->create();

        $this->actingAs($other)->get(route('coach.conversations.show', $conversation))->assertNotFound();
        $this->actingAs($other)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Tentative',
        ])->assertNotFound();
    }

    public function test_frontend_cannot_choose_an_assistant_role_and_usage_contains_prompt_metadata(): void
    {
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create(['language' => 'en']);

        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Help me plan my next step.',
            'role' => 'assistant',
        ])->assertRedirect();

        $this->assertSame('user', CoachMessage::where('content', 'Help me plan my next step.')->value('role'));
        $this->assertDatabaseHas('coach_messages', ['role' => 'assistant', 'content' => '[en] Your request has been taken into account.']);
        $this->assertDatabaseHas('coach_usages', [
            'provider' => 'fake',
            'prompt_key' => 'coach.general',
            'prompt_version' => '1.0',
            'input_tokens' => 24,
            'output_tokens' => 18,
            'estimated_cost_micros' => 0,
            'status' => 'success',
        ]);
    }

    public function test_invalid_structured_response_keeps_user_message_without_fake_assistant(): void
    {
        $this->app->instance(AIProviderInterface::class, new \App\Coach\AI\FakeAIProvider('invalid'));
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();

        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Message conservé',
        ])->assertRedirect()->assertSessionHas('error');

        $this->assertDatabaseHas('coach_messages', ['role' => 'user', 'content' => 'Message conservé']);
        $this->assertDatabaseMissing('coach_messages', ['coach_conversation_id' => $conversation->id, 'role' => 'assistant']);
        $this->assertDatabaseHas('coach_usages', ['status' => 'failed']);
    }

    public function test_disabled_coach_blocks_page_and_provider_call(): void
    {
        app(CoachSettingsService::class)->update(['enabled' => false]);
        $spy = new class implements AIProviderInterface {
            public int $calls = 0;
            public function generateText(AIRequest $request): AIResponse { $this->calls++; throw new \LogicException(); }
            public function generateStructured(AIRequest $request, array $schema): StructuredAIResponse { $this->calls++; throw new \LogicException(); }
        };
        $this->app->instance(AIProviderInterface::class, $spy);
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();

        $this->actingAs($user)->get('/dashboard-client/coach')->assertForbidden();
        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), ['content' => 'Bloqué'])->assertForbidden();
        $this->assertSame(0, $spy->calls);
    }

    public function test_rate_limit_applies_only_to_provider_operation(): void
    {
        app(CoachSettingsService::class)->update(['rate_limit_per_minute' => 1, 'monthly_message_limit' => 100]);
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();

        $this->actingAs($user)->get('/dashboard-client/coach')->assertOk();
        $this->actingAs($user)->get(route('coach.profile.edit'))->assertOk();
        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), ['content' => 'Premier'])->assertRedirect();
        $this->actingAs($user)->post(route('coach.conversations.messages.store', $conversation), ['content' => 'Second'])->assertTooManyRequests();
    }

    public function test_coach_context_never_contains_another_users_data(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        ProfessionalProfile::factory()->for($owner)->create(['summary' => 'PRIVATE_PROFILE_A']);
        $foreignDocument = UserDocument::factory()->for($owner)->create(['original_name' => 'PRIVATE_DOCUMENT_A.pdf']);
        ProfessionalProfile::factory()->for($other)->create(['summary' => 'PROFILE_B']);
        $conversation = CoachConversation::factory()->for($other)->create();

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

        $this->actingAs($other)->post(route('coach.conversations.messages.store', $conversation), [
            'content' => 'Analyse mon contexte',
            'document_ids' => [$foreignDocument->id],
        ])->assertRedirect();

        $this->assertStringContainsString('PROFILE_B', $spy->request->systemContext);
        $this->assertStringNotContainsString('PRIVATE_PROFILE_A', $spy->request->systemContext);
        $this->assertStringNotContainsString('PRIVATE_DOCUMENT_A', $spy->request->systemContext);
        $this->assertSame('fr', $spy->request->language);
    }

    public function test_unknown_configured_provider_fails_without_creating_assistant_message(): void
    {
        Setting::create(['type' => 'coach_provider', 'value' => 'unknown-provider']);
        Cache::forget('coach_settings');
        $user = User::factory()->create();
        $conversation = CoachConversation::factory()->for($user)->create();

        $this->actingAs($user)
            ->post(route('coach.conversations.messages.store', $conversation), ['content' => 'Essai'])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('coach_messages', ['coach_conversation_id' => $conversation->id, 'role' => 'assistant']);
        $this->assertDatabaseHas('coach_usages', ['provider' => 'unknown-provider', 'status' => 'failed']);
    }
}
