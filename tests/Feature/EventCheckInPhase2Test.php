<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventTicketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EventCheckInPhase2Test extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_admin_can_open_scanner_with_check_in_totals(): void
    {
        [$admin, $event, $participant] = $this->registration();
        $participant->update(['checked_in_at' => now(), 'checked_in_by' => $admin->id]);

        $this->actingAs($admin)
            ->get(route('events.scanner', $event->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('backend/events/scanner', false)
                ->where('event.slug', $event->slug)
                ->where('event.checked_in_places', 2)
                ->where('event.confirmed_places', 2));
    }

    public function test_non_admin_cannot_open_scanner_or_check_in(): void
    {
        [, $event, $participant] = $this->registration();
        $user = User::factory()->create(['role' => 'client', 'is_active' => 1]);
        $url = app(EventTicketService::class)->signedUrl($event, $participant);

        $this->actingAs($user)->get(route('events.scanner', $event->slug))->assertForbidden();
        $this->actingAs($user)->postJson(route('events.check-in', $event->slug), ['ticket_url' => $url])
            ->assertForbidden();
        $this->assertNull($participant->fresh()->checked_in_at);
    }

    public function test_valid_signed_ticket_is_checked_in_and_operator_is_recorded(): void
    {
        [$admin, $event, $participant] = $this->registration();
        $url = app(EventTicketService::class)->signedUrl($event, $participant);

        $this->actingAs($admin)
            ->postJson(route('events.check-in', $event->slug), ['ticket_url' => $url])
            ->assertOk()
            ->assertJsonPath('result', 'checked_in')
            ->assertJsonPath('participant.reference', $participant->reference)
            ->assertJsonPath('participant.quantity', 2);

        $participant->refresh();
        $this->assertNotNull($participant->checked_in_at);
        $this->assertSame($admin->id, $participant->checked_in_by);
    }

    public function test_second_scan_is_idempotent(): void
    {
        [$admin, $event, $participant] = $this->registration();
        $url = app(EventTicketService::class)->signedUrl($event, $participant);

        $this->actingAs($admin)->postJson(route('events.check-in', $event->slug), ['ticket_url' => $url])
            ->assertJsonPath('result', 'checked_in');
        $firstCheckIn = $participant->fresh()->checked_in_at;

        $this->travel(5)->minutes();
        $this->actingAs($admin)->postJson(route('events.check-in', $event->slug), ['ticket_url' => $url])
            ->assertOk()
            ->assertJsonPath('result', 'already_checked_in');

        $this->assertTrue($firstCheckIn->equalTo($participant->fresh()->checked_in_at));
    }

    public function test_tampered_or_unsigned_ticket_is_rejected(): void
    {
        [$admin, $event, $participant] = $this->registration();
        [, , $other] = $this->registration();
        $url = app(EventTicketService::class)->signedUrl($event, $participant);
        $tampered = str_replace($participant->reference, $other->reference, $url);

        $this->actingAs($admin)->postJson(route('events.check-in', $event->slug), ['ticket_url' => $tampered])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ticket');
        $this->actingAs($admin)->postJson(route('events.check-in', $event->slug), [
            'ticket_url' => route('events.tickets.show', $participant->reference),
        ])->assertUnprocessable()->assertJsonValidationErrors('ticket');
        $this->assertNull($participant->fresh()->checked_in_at);
    }

    public function test_ticket_for_another_event_is_rejected(): void
    {
        [$admin, $event] = $this->registration();
        [, $otherEvent, $otherParticipant] = $this->registration();
        $url = app(EventTicketService::class)->signedUrl($otherEvent, $otherParticipant);

        $this->actingAs($admin)->postJson(route('events.check-in', $event->slug), ['ticket_url' => $url])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ticket');
        $this->assertNull($otherParticipant->fresh()->checked_in_at);
    }

    public function test_cancelled_and_unpaid_tickets_are_rejected(): void
    {
        [$admin, $event, $cancelled] = $this->registration();
        $cancelledUrl = app(EventTicketService::class)->signedUrl($event, $cancelled);
        $cancelled->update(['status' => EventParticipant::STATUS_CANCELLED, 'cancelled_at' => now()]);

        $this->actingAs($admin)->postJson(route('events.check-in', $event->slug), ['ticket_url' => $cancelledUrl])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ticket');

        [, $paidEvent, $unpaid] = $this->registration(price: 100, paymentConfirmed: false);
        $forgedUrl = \Illuminate\Support\Facades\URL::signedRoute('events.tickets.show', [
            'reference' => $unpaid->reference,
        ]);
        $this->actingAs($admin)->postJson(route('events.check-in', $paidEvent->slug), ['ticket_url' => $forgedUrl])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ticket');
    }

    private function registration(float $price = 0, bool $paymentConfirmed = false): array
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Check-in',
            'slug' => 'check-in-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement check-in',
            'slug' => 'check-in-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $admin->id,
            'start_date' => now()->addHour(),
            'end_date' => now()->addHours(4),
            'price' => $price,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now(),
        ]);
        $participant = EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Participant scanner',
            'email' => 'scan-'.uniqid().'@example.com',
            'qty' => 2,
            'status' => EventParticipant::STATUS_COMPLETED,
            'reference' => EventParticipant::generateReference(),
            'payment_confirmed' => $paymentConfirmed,
            'payment_id' => $paymentConfirmed ? 'pi_scan' : null,
            'payment_amount' => $paymentConfirmed ? 210 : null,
        ]);

        return [$admin, $event, $participant];
    }
}
