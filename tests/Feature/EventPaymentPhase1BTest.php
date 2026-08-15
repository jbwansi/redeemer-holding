<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Notifications\InvoiceNotification;
use App\Services\Payments\Handlers\EventPaymentHandler;
use App\Services\Payments\StripeCheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use Tests\TestCase;

class EventPaymentPhase1BTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
        Notification::fake();
    }

    public function test_payment_session_contains_event_metadata_and_marks_registration_in_progress(): void
    {
        [$event, $participant] = $this->paidRegistration();
        $checkout = Mockery::mock(StripeCheckoutService::class);
        $checkout->shouldReceive('createSession')
            ->once()
            ->withArgs(function (array $payload) use ($event, $participant): bool {
                return $payload['metadata']['payment_type'] === 'event'
                    && $payload['metadata']['participant_id'] === $participant->id
                    && $payload['metadata']['event_id'] === $event->id
                    && $payload['client_reference_id'] === $participant->id
                    && $payload['customer_email'] === $participant->email;
            })
            ->andReturn((object) [
                'id' => 'cs_event_1',
                'url' => 'https://checkout.stripe.test/session',
            ]);
        $this->app->instance(StripeCheckoutService::class, $checkout);

        $response = $this->withSession(['temp_participant_'.$participant->id => true])
            ->get(route('events.payment', [$event->slug, $participant->id]));

        $response->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Frontend/events/payment')
            ->where('participant.id', $participant->id)
            ->where('checkoutUrl', 'https://checkout.stripe.test/session')
            ->where('total', 105));

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_IN_PROGRESS,
            'stripe_session_id' => 'cs_event_1',
            'payment_confirmed' => false,
        ]);
    }

    public function test_success_callback_confirms_payment_and_redirects_to_confirmation(): void
    {
        [$event, $participant] = $this->paidRegistration(EventParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_paid']);
        $this->mockRetrievedSession($this->checkoutSession($participant, 'cs_paid'));

        $response = $this->get(route('events.payment.success', ['session_id' => 'cs_paid']));

        $response->assertRedirect(route('events.registration.confirmation', [
            $event->slug,
            $participant->id,
        ]));
        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_id' => 'pi_paid',
            'payment_amount' => 105,
            'payment_confirmed' => true,
            'payment_error' => null,
        ]);
        Notification::assertSentTo($participant, InvoiceNotification::class);
    }

    public function test_checkout_webhook_is_idempotent_and_sends_one_invoice(): void
    {
        [, $participant] = $this->paidRegistration(EventParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_webhook']);
        $session = $this->checkoutSession($participant, 'cs_webhook');
        $handler = app(EventPaymentHandler::class);

        $handler->handleCheckoutSessionCompleted($session);
        $handler->handleCheckoutSessionCompleted($session);

        $participant->refresh();
        $this->assertSame(EventParticipant::STATUS_COMPLETED, $participant->status);
        $this->assertTrue($participant->payment_confirmed);
        $this->assertSame('pi_paid', $participant->payment_id);
        Notification::assertSentToTimes($participant, InvoiceNotification::class, 1);
    }

    public function test_payment_intent_webhook_can_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(EventParticipant::STATUS_IN_PROGRESS);

        app(EventPaymentHandler::class)->handlePaymentIntentSucceeded((object) [
            'id' => 'pi_intent',
            'amount_received' => 10500,
            'metadata' => (object) [
                'participant_id' => $participant->id,
                'event_id' => $participant->event_id,
            ],
        ]);

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_id' => 'pi_intent',
            'payment_amount' => 105,
            'payment_confirmed' => true,
        ]);
        Notification::assertSentTo($participant, InvoiceNotification::class);
    }

    public function test_incorrect_stripe_amount_does_not_confirm_payment(): void
    {
        [, $participant] = $this->paidRegistration(EventParticipant::STATUS_IN_PROGRESS);
        $participant->update(['stripe_session_id' => 'cs_wrong_amount']);

        app(EventPaymentHandler::class)->handleCheckoutSessionCompleted(
            $this->checkoutSession($participant, 'cs_wrong_amount', 10000)
        );

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_IN_PROGRESS,
            'payment_confirmed' => false,
            'payment_id' => null,
        ]);
        Notification::assertNothingSent();
    }

    public function test_failed_payment_returns_registration_to_pending_without_regressing_paid_registration(): void
    {
        [, $participant] = $this->paidRegistration(EventParticipant::STATUS_IN_PROGRESS);
        $handler = app(EventPaymentHandler::class);
        $failure = (object) [
            'metadata' => (object) [
                'participant_id' => $participant->id,
                'event_id' => $participant->event_id,
            ],
            'last_payment_error' => (object) ['message' => 'Carte refusée'],
        ];

        $handler->handlePaymentFailed($failure);

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_PENDING,
            'payment_error' => 'Carte refusée',
            'payment_confirmed' => false,
        ]);

        $participant->update([
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_confirmed' => true,
            'payment_id' => 'pi_final',
        ]);
        $handler->handlePaymentFailed($failure);

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_confirmed' => true,
            'payment_id' => 'pi_final',
        ]);
    }

    public function test_invalid_success_callback_is_controlled(): void
    {
        $this->get(route('events.payment.success'))
            ->assertRedirect(route('evenements'))
            ->assertSessionHas('error');
    }

    private function paidRegistration(
        string $status = EventParticipant::STATUS_PENDING
    ): array {
        $owner = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Paiement',
            'slug' => 'paiement-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement payant',
            'slug' => 'event-payant-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $owner->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => 100,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
        $participant = EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Participant test',
            'email' => 'participant@example.com',
            'qty' => 1,
            'status' => $status,
            'reference' => EventParticipant::generateReference(),
        ]);

        return [$event, $participant];
    }

    private function checkoutSession(
        EventParticipant $participant,
        string $sessionId,
        int $amount = 10500
    ): object {
        return (object) [
            'id' => $sessionId,
            'payment_status' => 'paid',
            'client_reference_id' => $participant->id,
            'payment_intent' => 'pi_paid',
            'amount_total' => $amount,
            'metadata' => (object) [
                'payment_type' => 'event',
                'participant_id' => $participant->id,
                'event_id' => $participant->event_id,
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
}
