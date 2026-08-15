<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Mail\RegistrationConfirmationMail;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventTicketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EventTicketPhase1DTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_confirmed_free_registration_has_a_valid_signed_ticket(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        $url = app(EventTicketService::class)->signedUrl($event, $participant);

        $this->assertNotNull($url);
        $this->get($url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/events/ticket')
                ->where('event.title', $event->title)
                ->where('ticket.reference', $participant->reference)
                ->where('ticket.participant_name', $participant->name)
                ->where('ticket.quantity', $participant->qty)
                ->where('ticket.state', 'valid')
                ->where('ticket.is_valid', true)
                ->missing('ticket.email')
                ->missing('ticket.phone')
                ->missing('ticket.payment_id')
                ->missing('ticket.user_id'));
    }

    public function test_confirmed_paid_registration_has_a_ticket_but_unpaid_registration_does_not(): void
    {
        [$paidEvent, $paid] = $this->registration(price: 100, paymentConfirmed: true);
        [$unpaidEvent, $unpaid] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_PENDING
        );

        $this->assertNotNull(app(EventTicketService::class)->signedUrl($paidEvent, $paid));
        $this->assertNull(app(EventTicketService::class)->signedUrl($unpaidEvent, $unpaid));
    }

    public function test_unsigned_or_tampered_ticket_url_is_forbidden(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        [, $otherParticipant] = $this->registration(price: 0);

        $this->get(route('events.tickets.show', $participant->reference))->assertForbidden();

        $signedUrl = app(EventTicketService::class)->signedUrl($event, $participant);
        $tamperedUrl = str_replace($participant->reference, $otherParticipant->reference, $signedUrl);

        $this->get($tamperedUrl)->assertForbidden();
    }

    public function test_cancelled_ticket_is_revoked_without_changing_its_signed_url(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        $url = app(EventTicketService::class)->signedUrl($event, $participant);

        $participant->update([
            'status' => EventParticipant::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        $this->get($url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ticket.state', 'cancelled')
                ->where('ticket.is_valid', false));
    }

    public function test_ticket_becomes_expired_after_event_end(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        $url = app(EventTicketService::class)->signedUrl($event, $participant);
        $event->update([
            'start_date' => now()->subDays(2),
            'end_date' => now()->subDay(),
        ]);

        $this->get($url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ticket.state', 'expired')
                ->where('ticket.is_valid', false));
    }

    public function test_ticket_verification_is_read_only(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        $url = app(EventTicketService::class)->signedUrl($event, $participant);
        $original = $participant->fresh()->getAttributes();

        $this->get($url)->assertOk();

        $this->assertSame($original, $participant->fresh()->getAttributes());
    }

    public function test_free_event_confirmation_email_contains_the_signed_ticket_url(): void
    {
        [$event, $participant] = $this->registration(price: 0);
        $mail = new RegistrationConfirmationMail('event', $event, $participant);

        $this->assertNotNull($mail->ticketUrl);
        $this->assertStringContainsString('/billets/evenements/'.$participant->reference, $mail->ticketUrl);
        $this->assertStringContainsString('signature=', $mail->ticketUrl);
    }

    private function registration(
        float $price,
        string $status = EventParticipant::STATUS_COMPLETED,
        bool $paymentConfirmed = false
    ): array {
        $owner = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Billet',
            'slug' => 'billet-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement avec billet',
            'slug' => 'billet-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $owner->id,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
            'price' => $price,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
        $participant = EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Participant billet',
            'email' => 'ticket-'.uniqid().'@example.com',
            'phone' => '+41790000000',
            'qty' => 2,
            'status' => $status,
            'reference' => EventParticipant::generateReference(),
            'payment_confirmed' => $paymentConfirmed,
            'payment_id' => $paymentConfirmed ? 'pi_ticket' : null,
            'payment_amount' => $paymentConfirmed ? 210 : null,
            'payment_date' => $paymentConfirmed ? now() : null,
        ]);

        return [$event, $participant];
    }
}
