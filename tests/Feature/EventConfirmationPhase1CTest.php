<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EventConfirmationPhase1CTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_free_completed_registration_is_confirmed_with_a_signed_ticket_url(): void
    {
        [$event, $participant] = $this->registration(price: 0);

        $this->withSession(['temp_participant_'.$participant->id => true])
            ->get($this->confirmationUrl($event, $participant))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/events/registration-confirmation')
                ->where('event.id', $event->id)
                ->where('registration.id', $participant->id)
                ->where('confirmation.state', 'confirmed')
                ->where('confirmation.title', 'Inscription confirmée')
                ->where('confirmation.is_confirmed', true)
                ->where('confirmation.is_free', true)
                ->where('confirmation.can_show_calendar', true)
                ->where('confirmation.can_download_invoice', false)
                ->where('confirmation.invoice_url', null)
                ->where('confirmation.can_resume_payment', false)
                ->where('confirmation.ticket_url', fn ($url) => is_string($url)
                    && str_contains($url, '/billets/evenements/'.$participant->reference)
                    && str_contains($url, 'signature=')));
    }

    public function test_unpaid_registration_is_not_presented_as_confirmed_and_can_resume_payment(): void
    {
        [$event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_PENDING
        );

        $this->withSession(['temp_participant_'.$participant->id => true])
            ->get($this->confirmationUrl($event, $participant))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('confirmation.state', 'awaiting_payment')
                ->where('confirmation.is_confirmed', false)
                ->where('confirmation.can_download_invoice', false)
                ->where('confirmation.can_show_calendar', false)
                ->where('confirmation.can_resume_payment', true)
                ->where('confirmation.resume_payment_url', route('events.payment', [
                    $event->slug,
                    $participant->id,
                ])));
    }

    public function test_paid_registration_exposes_invoice_only_after_payment_confirmation(): void
    {
        [$event, $participant] = $this->registration(
            price: 100,
            paymentConfirmed: true
        );

        $this->withSession(['temp_participant_'.$participant->id => true])
            ->get($this->confirmationUrl($event, $participant))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('confirmation.state', 'confirmed')
                ->where('confirmation.is_confirmed', true)
                ->where('confirmation.can_download_invoice', true)
                ->where('confirmation.invoice_url', route('evenements.facture.download', [
                    $event->slug,
                    $participant->reference,
                ]))
                ->where('confirmation.can_resume_payment', false)
                ->where('confirmation.can_cancel', true));
    }

    public function test_payment_in_progress_and_cancelled_states_are_not_confirmed(): void
    {
        [$processingEvent, $processing] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_IN_PROGRESS
        );

        $this->withSession(['temp_participant_'.$processing->id => true])
            ->get($this->confirmationUrl($processingEvent, $processing))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('confirmation.state', 'payment_processing')
                ->where('confirmation.is_confirmed', false)
                ->where('confirmation.can_resume_payment', false));

        [$cancelledEvent, $cancelled] = $this->registration(
            price: 0,
            status: EventParticipant::STATUS_CANCELLED
        );

        $this->withSession(['temp_participant_'.$cancelled->id => true])
            ->get($this->confirmationUrl($cancelledEvent, $cancelled))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('confirmation.state', 'cancelled')
                ->where('confirmation.is_confirmed', false)
                ->where('confirmation.can_cancel', false)
                ->where('confirmation.can_show_calendar', false));
    }

    public function test_guest_without_registration_session_cannot_view_confirmation(): void
    {
        [$event, $participant] = $this->registration(price: 0);

        $this->get($this->confirmationUrl($event, $participant))->assertForbidden();
    }

    public function test_authenticated_owner_can_view_confirmation_but_another_user_cannot(): void
    {
        $owner = User::factory()->create();
        [$event, $participant] = $this->registration(price: 0, user: $owner);

        $this->actingAs($owner)
            ->get($this->confirmationUrl($event, $participant))
            ->assertOk();

        $this->actingAs(User::factory()->create())
            ->get($this->confirmationUrl($event, $participant))
            ->assertForbidden();
    }

    public function test_registration_from_another_event_returns_not_found(): void
    {
        [$event] = $this->registration(price: 0);
        [, $otherParticipant] = $this->registration(price: 0);

        $this->withSession(['temp_participant_'.$otherParticipant->id => true])
            ->get($this->confirmationUrl($event, $otherParticipant))
            ->assertNotFound();
    }

    private function registration(
        float $price,
        string $status = EventParticipant::STATUS_COMPLETED,
        bool $paymentConfirmed = false,
        ?User $user = null
    ): array {
        $eventOwner = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Confirmation',
            'slug' => 'confirmation-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement confirmation',
            'slug' => 'confirmation-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $eventOwner->id,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
            'price' => $price,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
        $participant = EventParticipant::query()->create([
            'user_id' => $user?->id,
            'event_id' => $event->id,
            'name' => 'Participant test',
            'email' => 'participant-'.uniqid().'@example.com',
            'qty' => 1,
            'status' => $status,
            'reference' => EventParticipant::generateReference(),
            'payment_confirmed' => $paymentConfirmed,
            'payment_id' => $paymentConfirmed ? 'pi_confirmed' : null,
            'payment_amount' => $paymentConfirmed ? 105 : null,
            'payment_date' => $paymentConfirmed ? now() : null,
        ]);

        return [$event, $participant];
    }

    private function confirmationUrl(Event $event, EventParticipant $participant): string
    {
        return route('events.registration.confirmation', [$event->slug, $participant->id]);
    }
}
