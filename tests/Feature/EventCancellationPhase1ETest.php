<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventTicketService;
use App\Services\Payments\Handlers\EventPaymentHandler;
use App\Services\Payments\StripeRefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery;
use Tests\TestCase;

class EventCancellationPhase1ETest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_free_registration_is_cancelled_without_contacting_stripe(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        $refunds = Mockery::mock(StripeRefundService::class);
        $refunds->shouldNotReceive('createFullRefund');
        $this->app->instance(StripeRefundService::class, $refunds);

        $this->cancelAsGuest($event, $participant)->assertRedirect(route('evenements.details', $event->slug));

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_CANCELLED,
            'cancellation_reason' => 'customer_requested',
            'refund_id' => null,
        ]);
    }

    public function test_paid_registration_is_refunded_before_being_cancelled(): void
    {
        [$event, $participant] = $this->registration(price: 100, paid: true);
        $refunds = Mockery::mock(StripeRefundService::class);
        $refunds->shouldReceive('createFullRefund')
            ->once()
            ->withArgs(function (string $paymentId, array $metadata, string $key) use ($event, $participant) {
                return $paymentId === 'pi_event_paid'
                    && $metadata['payment_type'] === 'event'
                    && $metadata['participant_id'] === $participant->id
                    && $metadata['event_id'] === $event->id
                    && $key === 'event-refund-'.$participant->id.'-pi_event_paid';
            })
            ->andReturn((object) [
                'id' => 're_event_paid',
                'status' => 'succeeded',
                'amount' => 10500,
            ]);
        $this->app->instance(StripeRefundService::class, $refunds);

        $this->cancelAsGuest($event, $participant)->assertRedirect();

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_CANCELLED,
            'refund_id' => 're_event_paid',
            'refund_status' => 'succeeded',
            'refund_amount' => 105,
            'cancellation_reason' => 'customer_requested',
        ]);
        $this->assertNull(app(EventTicketService::class)->signedUrl($event, $participant->fresh()));
    }

    public function test_repeated_cancellation_does_not_create_a_second_refund(): void
    {
        [$event, $participant] = $this->registration(price: 100, paid: true);
        $refunds = Mockery::mock(StripeRefundService::class);
        $refunds->shouldReceive('createFullRefund')
            ->once()
            ->andReturn((object) [
                'id' => 're_once',
                'status' => 'pending',
                'amount' => 10500,
            ]);
        $this->app->instance(StripeRefundService::class, $refunds);

        $this->cancelAsGuest($event, $participant)->assertRedirect();
        $this->cancelAsGuest($event, $participant)->assertRedirect();

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_CANCELLED,
            'refund_id' => 're_once',
        ]);
    }

    public function test_stripe_failure_keeps_paid_registration_confirmed(): void
    {
        [$event, $participant] = $this->registration(price: 100, paid: true);
        $refunds = Mockery::mock(StripeRefundService::class);
        $refunds->shouldReceive('createFullRefund')
            ->once()
            ->andThrow(new \RuntimeException('Stripe unavailable'));
        $this->app->instance(StripeRefundService::class, $refunds);

        $this->cancelAsGuest($event, $participant)->assertSessionHasErrors('general');

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_confirmed' => true,
            'refund_id' => null,
            'cancelled_at' => null,
        ]);
    }

    public function test_paid_registration_without_payment_reference_is_not_cancelled(): void
    {
        [$event, $participant] = $this->registration(price: 100, paid: true);
        $participant->update(['payment_id' => null]);

        $this->cancelAsGuest($event, $participant)->assertSessionHasErrors('general');

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_COMPLETED,
            'refund_id' => null,
        ]);
    }

    public function test_customer_deadline_is_enforced_and_admin_can_bypass_it(): void
    {
        [$event, $participant] = $this->registration(price: 0, startsInHours: 12);

        $this->cancelAsGuest($event, $participant)->assertSessionHasErrors('general');
        $this->assertDatabaseMissing('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_CANCELLED,
        ]);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->delete(route('events.registration.cancel', [$event->slug, $participant->id]))
            ->assertRedirect();

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_CANCELLED,
            'cancellation_reason' => 'admin_requested',
        ]);
    }

    public function test_refund_webhook_updates_only_the_matching_refund(): void
    {
        [, $participant] = $this->registration(price: 100, paid: true);
        $participant->update([
            'status' => EventParticipant::STATUS_CANCELLED,
            'refund_id' => 're_matching',
            'refund_status' => 'pending',
            'refund_amount' => 105,
            'refund_date' => now(),
        ]);

        app(EventPaymentHandler::class)->handleRefundUpdated((object) [
            'id' => 're_matching',
            'status' => 'succeeded',
            'amount' => 10500,
            'metadata' => (object) [
                'participant_id' => $participant->id,
                'event_id' => $participant->event_id,
            ],
        ]);

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'refund_id' => 're_matching',
            'refund_status' => 'succeeded',
            'refund_amount' => 105,
        ]);
    }

    private function cancelAsGuest(Event $event, EventParticipant $participant)
    {
        return $this->withSession(['temp_participant_'.$participant->id => true])
            ->delete(route('events.registration.cancel', [$event->slug, $participant->id]));
    }

    private function registration(
        float $price,
        bool $paid = false,
        int $startsInHours = 72
    ): array {
        $owner = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Annulation',
            'slug' => 'annulation-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement annulable',
            'slug' => 'annulation-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $owner->id,
            'start_date' => now()->addHours($startsInHours),
            'end_date' => now()->addHours($startsInHours + 4),
            'price' => $price,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
        $participant = EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Participant annulation',
            'email' => 'cancel-'.uniqid().'@example.com',
            'qty' => 1,
            'status' => EventParticipant::STATUS_COMPLETED,
            'reference' => EventParticipant::generateReference(),
            'payment_confirmed' => $paid,
            'payment_id' => $paid ? 'pi_event_paid' : null,
            'payment_amount' => $paid ? 105 : null,
            'payment_date' => $paid ? now() : null,
        ]);

        return [$event, $participant];
    }
}
