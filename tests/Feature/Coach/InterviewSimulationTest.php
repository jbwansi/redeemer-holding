<?php

namespace Tests\Feature\Coach;

use App\Coach\AI\AIProviderInterface;
use App\Coach\AI\FakeAIProvider;
use App\Coach\DTO\AIRequest;
use App\Coach\DTO\AIResponse;
use App\Coach\DTO\StructuredAIResponse;
use App\Coach\Services\CoachSettingsService;
use App\Coach\Services\InterviewCoachService;
use App\Http\Middleware\OnlyTestUsers;
use App\Models\CoachUsage;
use App\Models\InterviewSimulation;
use App\Models\ProfessionalProfile;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class InterviewSimulationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
        Cache::forget('coach_settings');
        app(CoachSettingsService::class)->update([
            'enabled' => true, 'module_interview' => true, 'interview_question_limit' => 3,
            'monthly_message_limit' => 100, 'rate_limit_per_minute' => 100,
        ]);
    }

    public function test_simulation_is_created_without_complete_profile_and_has_first_question(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('coach.interviews.store'), $this->payload())
            ->assertRedirect();

        $simulation = InterviewSimulation::firstOrFail();
        $this->assertNull($user->professionalProfile);
        $this->assertSame('ready', $simulation->status);
        $this->assertSame(1, $simulation->current_turn);
        $this->assertCount(3, $simulation->turns);
        $this->assertNotNull($simulation->currentTurn());
        $this->assertSame('interview', $simulation->conversation->module);
        $this->assertDatabaseHas('coach_usages', ['operation' => 'interview.analyze_job', 'status' => 'success']);
        $this->assertDatabaseHas('coach_usages', ['operation' => 'interview.generate_questions', 'status' => 'success']);
    }

    public function test_owner_document_is_accepted_and_foreign_document_is_rejected(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        ProfessionalProfile::factory()->for($owner)->create();
        $ownDocument = UserDocument::factory()->for($owner)->create(['type' => 'cv']);
        $foreignDocument = UserDocument::factory()->for($other)->create(['type' => 'cv']);

        $this->actingAs($owner)->post(route('coach.interviews.store'), $this->payload(['document_ids' => [$ownDocument->id]]))->assertRedirect();
        $this->actingAs($owner)->post(route('coach.interviews.store'), $this->payload(['document_ids' => [$foreignDocument->id]]))->assertNotFound();
    }

    public function test_other_user_cannot_view_answer_or_debrief_simulation(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $simulation = app(InterviewCoachService::class)->create($owner, $this->payload());

        $this->actingAs($other)->get(route('coach.interviews.show', $simulation))->assertNotFound();
        $this->actingAs($other)->post(route('coach.interviews.answers.store', $simulation), ['answer' => 'Intrusion', 'submission_token' => (string) Str::uuid()])->assertNotFound();
        $this->actingAs($other)->get(route('coach.interviews.debrief', $simulation))->assertNotFound();
    }

    public function test_answer_advances_progress_and_simulation_can_be_resumed_from_database(): void
    {
        $user = User::factory()->create();
        $simulation = app(InterviewCoachService::class)->create($user, $this->payload());
        $token = (string) Str::uuid();

        $this->actingAs($user)->post(route('coach.interviews.answers.store', $simulation), ['answer' => 'Réponse structurée', 'submission_token' => $token])->assertRedirect();
        $simulation->refresh();
        $this->assertSame('in_progress', $simulation->status);
        $this->assertSame(2, $simulation->current_turn);
        $this->assertSame(33, $simulation->progressPercentage());
        $this->actingAs($user)->get(route('coach.interviews.show', $simulation))->assertOk();
        $this->assertSame(2, $simulation->fresh()->current_turn);
    }

    public function test_double_answer_submission_is_idempotent(): void
    {
        $user = User::factory()->create();
        $simulation = app(InterviewCoachService::class)->create($user, $this->payload());
        $token = (string) Str::uuid();
        $service = app(InterviewCoachService::class);

        $service->answer($user, $simulation, 'Même réponse', $token);
        $usageAfterFirst = CoachUsage::count();
        $service->answer($user, $simulation->fresh(), 'Même réponse', $token);

        $this->assertSame(2, $simulation->fresh()->current_turn);
        $this->assertSame(1, $simulation->turns()->whereNotNull('answered_at')->count());
        $this->assertSame($usageAfterFirst, CoachUsage::count());
    }

    public function test_last_answer_completes_simulation_and_builds_actionable_debrief(): void
    {
        $user = User::factory()->create();
        $simulation = app(InterviewCoachService::class)->create($user, $this->payload());
        $service = app(InterviewCoachService::class);
        foreach ($simulation->turns as $turn) {
            $simulation = $service->answer($user, $simulation->fresh(), 'Réponse '.$turn->position, (string) Str::uuid());
        }

        $this->assertSame('completed', $simulation->status);
        $this->assertNotNull($simulation->completed_at);
        $this->assertNotEmpty($simulation->strengths);
        $this->assertNotEmpty($simulation->recommended_actions);
        $this->assertNotEmpty($simulation->candidate_questions);
        $this->actingAs($user)->get(route('coach.interviews.debrief', $simulation))->assertOk();
        $this->assertDatabaseHas('coach_usages', ['operation' => 'interview.debrief', 'status' => 'success']);
    }

    public function test_disabled_module_quota_and_provider_error_are_controlled(): void
    {
        $user = User::factory()->create();
        app(CoachSettingsService::class)->update(['module_interview' => false]);
        $this->actingAs($user)->get(route('coach.interviews.index'))->assertForbidden();

        app(CoachSettingsService::class)->update(['module_interview' => true, 'monthly_message_limit' => 1]);
        CoachUsage::factory()->for($user)->create(['coach_conversation_id' => null]);
        $this->actingAs($user)->post(route('coach.interviews.store'), $this->payload())->assertTooManyRequests();

        app(CoachSettingsService::class)->update(['monthly_message_limit' => 100]);
        $this->app->instance(AIProviderInterface::class, new FakeAIProvider('error'));
        $this->actingAs($user)->post(route('coach.interviews.store'), $this->payload())->assertRedirect()->assertSessionHas('error');
        $this->assertDatabaseHas('interview_simulations', ['user_id' => $user->id, 'status' => 'draft']);
        $this->assertDatabaseMissing('interview_simulations', ['user_id' => $user->id, 'status' => 'completed']);
    }

    public function test_provider_error_during_answer_keeps_current_turn_unanswered(): void
    {
        $user = User::factory()->create();
        $simulation = app(InterviewCoachService::class)->create($user, $this->payload());
        $this->app->instance(AIProviderInterface::class, new FakeAIProvider('error'));

        $this->actingAs($user)->post(route('coach.interviews.answers.store', $simulation), [
            'answer' => 'Réponse à préserver', 'submission_token' => (string) Str::uuid(),
        ])->assertRedirect()->assertSessionHas('error');

        $this->assertNull($simulation->currentTurn()->fresh()->answer);
        $this->assertSame(1, $simulation->fresh()->current_turn);
        $this->assertDatabaseHas('coach_usages', ['operation' => 'interview.evaluate_answer', 'status' => 'failed']);
    }

    public function test_failed_debrief_does_not_complete_and_retry_finishes_once(): void
    {
        $user = User::factory()->create();
        $simulation = app(InterviewCoachService::class)->create($user, $this->payload());
        $provider = new class implements AIProviderInterface {
            private FakeAIProvider $fake;
            public function __construct() { $this->fake = new FakeAIProvider(); }
            public function generateText(AIRequest $request): AIResponse { return $this->fake->generateText($request); }
            public function generateStructured(AIRequest $request, array $schema): StructuredAIResponse
            {
                if ($request->promptKey === 'interview.debrief') { throw new \RuntimeException('Debrief unavailable'); }
                return $this->fake->generateStructured($request, $schema);
            }
        };
        $this->app->instance(AIProviderInterface::class, $provider);
        $lastToken = '';
        foreach ($simulation->turns as $turn) {
            $lastToken = (string) Str::uuid();
            $this->actingAs($user)->post(route('coach.interviews.answers.store', $simulation), ['answer' => 'Réponse '.$turn->position, 'submission_token' => $lastToken])->assertRedirect();
            $simulation->refresh();
        }
        $this->assertSame('in_progress', $simulation->status);
        $this->assertNull($simulation->completed_at);

        $this->app->instance(AIProviderInterface::class, new FakeAIProvider());
        $this->actingAs($user)->post(route('coach.interviews.answers.store', $simulation), ['answer' => 'Réponse finale', 'submission_token' => $lastToken])->assertRedirect(route('coach.interviews.debrief', $simulation));
        $this->assertSame('completed', $simulation->fresh()->status);
        $this->assertSame(1, CoachUsage::where('operation', 'interview.debrief')->where('status', 'success')->count());
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'job_title' => 'Product Manager', 'company_name' => 'Redeemer',
            'job_description' => 'Piloter une équipe produit.', 'interview_type' => 'general',
            'difficulty' => 'standard', 'language' => 'fr', 'document_ids' => [],
        ], $overrides);
    }
}
