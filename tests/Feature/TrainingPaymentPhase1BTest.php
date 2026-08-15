<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use App\Notifications\TrainingInvoiceNotification;
use App\Services\Payments\Handlers\TrainingPaymentHandler;
use App\Services\Payments\StripeCheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\TestCase;

class TrainingPaymentPhase1BTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
        Notification::fake();
    }

    public function test_callback_then_webhook_confirms_payment_once_and_sends_one_invoice(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_training']);
        $handler = app(TrainingPaymentHandler::class);

        $this->mockRetrievedSession($this->checkoutSession($participant, 'cs_training'));
        $this->get(route('trainings.payment.success', ['session_id' => 'cs_training']))
            ->assertRedirect(route('trainings.registration.confirmation', [
                $participant->training->slug,
                $participant->id,
            ]));

        $handler->handlePaymentIntentSucceeded($this->paymentIntent($participant, 'pi_training'));

        $participant->refresh();
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        $this->assertTrue($participant->payment_confirmed);
        $this->assertSame('pi_training', $participant->payment_id);
        $this->assertSame('105.00', $participant->payment_amount);
        Notification::assertSentToTimes($participant, TrainingInvoiceNotification::class, 1);
    }

    public function test_webhook_then_callback_produces_the_same_final_state(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_training']);
        $handler = app(TrainingPaymentHandler::class);

        $handler->handlePaymentIntentSucceeded($this->paymentIntent($participant, 'pi_training'));

        $this->mockRetrievedSession($this->checkoutSession($participant, 'cs_training'));
        $this->get(route('trainings.payment.success', ['session_id' => 'cs_training']))
            ->assertRedirect(route('trainings.registration.confirmation', [
                $participant->training->slug,
                $participant->id,
            ]));

        $participant->refresh();
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        $this->assertTrue($participant->payment_confirmed);
        $this->assertSame('pi_training', $participant->payment_id);
        $this->assertSame('105.00', $participant->payment_amount);
        Notification::assertSentToTimes($participant, TrainingInvoiceNotification::class, 1);
    }

    public function test_payment_intent_webhook_is_idempotent(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $handler = app(TrainingPaymentHandler::class);
        $intent = $this->paymentIntent($participant, 'pi_training');

        $handler->handlePaymentIntentSucceeded($intent);
        $handler->handlePaymentIntentSucceeded($intent);

        $participant->refresh();
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        Notification::assertSentToTimes($participant, TrainingInvoiceNotification::class, 1);
    }

    public function test_checkout_webhook_is_idempotent(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_training']);
        $handler = app(TrainingPaymentHandler::class);
        $session = $this->checkoutSession($participant, 'cs_training');

        $handler->handleCheckoutSessionCompleted($session);
        $handler->handleCheckoutSessionCompleted($session);

        $participant->refresh();
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        Notification::assertSentToTimes($participant, TrainingInvoiceNotification::class, 1);
    }

    public function test_repeated_success_callback_does_not_duplicate_invoice(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_training']);
        $session = $this->checkoutSession($participant, 'cs_training');

        $this->mockRetrievedSession($session);
        $this->get(route('trainings.payment.success', ['session_id' => 'cs_training']));

        $this->mockRetrievedSession($session);
        $this->get(route('trainings.payment.success', ['session_id' => 'cs_training']));

        $participant->refresh();
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        Notification::assertSentToTimes($participant, TrainingInvoiceNotification::class, 1);
    }

    public function test_callback_with_wrong_payment_type_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_invalid_type']);

        $this->assertCallbackDoesNotConfirm($participant, $this->checkoutSession(
            $participant,
            'cs_invalid_type',
            metadata: ['payment_type' => 'event']
        ));
    }

    public function test_callback_with_wrong_training_id_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_invalid_training']);

        $this->assertCallbackDoesNotConfirm($participant, $this->checkoutSession(
            $participant,
            'cs_invalid_training',
            metadata: ['training_id' => $participant->training_id + 999]
        ));
    }

    public function test_callback_with_wrong_participant_id_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_invalid_participant']);

        $this->assertCallbackDoesNotConfirm($participant, $this->checkoutSession(
            $participant,
            'cs_invalid_participant',
            metadata: ['participant_id' => $participant->id + 999]
        ));
    }

    public function test_callback_with_wrong_currency_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_invalid_currency']);

        $this->assertCallbackDoesNotConfirm($participant, $this->checkoutSession(
            $participant,
            'cs_invalid_currency',
            currency: 'eur'
        ));
    }

    public function test_incorrect_stripe_amount_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);

        $intent = $this->paymentIntent($participant, 'pi_wrong', 10000);
        app(TrainingPaymentHandler::class)->handlePaymentIntentSucceeded($intent);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_IN_PROGRESS,
            'payment_confirmed' => false,
            'payment_id' => null,
        ]);
        Notification::assertNothingSent();
    }

    public function test_wrong_training_id_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);

        $intent = (object) [
            'id' => 'pi_wrong_training',
            'amount_received' => 10500,
            'currency' => 'chf',
            'metadata' => (object) [
                'payment_type' => 'training',
                'participant_id' => $participant->id,
                'training_id' => $participant->training_id + 999,
            ],
        ];

        app(TrainingPaymentHandler::class)->handlePaymentIntentSucceeded($intent);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_IN_PROGRESS,
            'payment_confirmed' => false,
        ]);
        Notification::assertNothingSent();
    }

    public function test_wrong_participant_id_does_not_confirm_any_registration(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);

        $intent = (object) [
            'id' => 'pi_wrong_participant',
            'amount_received' => 10500,
            'currency' => 'chf',
            'metadata' => (object) [
                'payment_type' => 'training',
                'participant_id' => $participant->id + 999,
                'training_id' => $participant->training_id,
            ],
        ];

        app(TrainingPaymentHandler::class)->handlePaymentIntentSucceeded($intent);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_IN_PROGRESS,
            'payment_confirmed' => false,
        ]);
        Notification::assertNothingSent();
    }

    public function test_wrong_payment_type_cannot_finalize_a_training_participant(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);

        $intent = (object) [
            'id' => 'pi_event_type',
            'amount_received' => 10500,
            'currency' => 'chf',
            'metadata' => (object) [
                'payment_type' => 'event',
                'participant_id' => $participant->id,
                'training_id' => $participant->training_id,
            ],
        ];

        app(TrainingPaymentHandler::class)->handlePaymentIntentSucceeded($intent);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_IN_PROGRESS,
            'payment_confirmed' => false,
        ]);
        Notification::assertNothingSent();
    }

    public function test_failed_payment_returns_registration_to_pending_without_regressing_paid_registration(): void
    {
        [, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);
        $handler = app(TrainingPaymentHandler::class);
        $failure = (object) [
            'metadata' => (object) [
                'participant_id' => $participant->id,
                'training_id' => $participant->training_id,
            ],
            'last_payment_error' => (object) ['message' => 'Carte refusée'],
        ];

        $handler->handlePaymentFailed($failure);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_PENDING,
            'payment_error' => 'Carte refusée',
            'payment_confirmed' => false,
        ]);

        $participant->update([
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_confirmed' => true,
            'payment_id' => 'pi_final',
        ]);
        $handler->handlePaymentFailed($failure);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_confirmed' => true,
            'payment_id' => 'pi_final',
        ]);
    }

    public function test_no_lms_access_before_payment_confirmed(): void
    {
        [$user, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);

        $this->actingAs($user)
            ->get(route('learning.show', $participant->training))
            ->assertForbidden();
    }

    public function test_lms_access_granted_after_payment_confirmed(): void
    {
        [$user, $participant] = $this->paidRegistration(TrainingParticipant::STATUS_IN_PROGRESS);

        app(TrainingPaymentHandler::class)->handlePaymentIntentSucceeded(
            $this->paymentIntent($participant, 'pi_training')
        );

        $this->actingAs($user)
            ->get(route('learning.show', $participant->training->fresh()))
            ->assertOk();
    }

    private function paidRegistration(
        string $status = TrainingParticipant::STATUS_PENDING
    ): array {
        $user = User::factory()->create(['role' => 'client']);
        $training = Training::query()->create([
            'title' => 'Formation payante',
            'slug' => 'formation-payante-'.uniqid(),
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => 100,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
        $participant = TrainingParticipant::query()->create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'name' => 'Participant test',
            'email' => 'participant@example.com',
            'qty' => 1,
            'status' => $status,
            'reference' => TrainingParticipant::generateReference(),
        ]);

        return [$user, $participant];
    }

    private function checkoutSession(
        TrainingParticipant $participant,
        string $sessionId,
        int $amount = 10500,
        string $currency = 'chf',
        array $metadata = []
    ): object {
        return (object) [
            'id' => $sessionId,
            'payment_status' => 'paid',
            'currency' => $currency,
            'client_reference_id' => $participant->id,
            'payment_intent' => 'pi_training',
            'amount_total' => $amount,
            'metadata' => (object) array_replace([
                'payment_type' => 'training',
                'participant_id' => $participant->id,
                'training_id' => $participant->training_id,
            ], $metadata),
        ];
    }

    private function paymentIntent(
        TrainingParticipant $participant,
        string $paymentIntentId,
        int $amount = 10500
    ): object {
        return (object) [
            'id' => $paymentIntentId,
            'amount_received' => $amount,
            'currency' => 'chf',
            'metadata' => (object) [
                'payment_type' => 'training',
                'participant_id' => $participant->id,
                'training_id' => $participant->training_id,
            ],
        ];
    }

    private function mockRetrievedSession(object $session): void
    {
        $checkout = Mockery::mock(StripeCheckoutService::class);
        $checkout->shouldReceive('retrieveSession')
            ->once()
            ->with($session->id)
            ->andReturn($session);
        $this->app->instance(StripeCheckoutService::class, $checkout);
    }

    private function assertCallbackDoesNotConfirm(TrainingParticipant $participant, object $session): void
    {
        $this->mockRetrievedSession($session);

        $this->get(route('trainings.payment.success', ['session_id' => $session->id]))
            ->assertRedirect(route('formations'));

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_IN_PROGRESS,
            'payment_confirmed' => false,
            'payment_id' => null,
        ]);
        Notification::assertNothingSent();
    }
}
