<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EventInvoiceDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_paid_event_with_confirmed_payment_can_download_the_invoice(): void
    {
        [$user, $event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_COMPLETED,
            paymentConfirmed: true
        );
        $this->fakePdfDownload();

        $this->actingAs($user)
            ->get($this->invoiceUrl($event, $participant))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_paid_event_completed_but_not_payment_confirmed_cannot_download_the_invoice(): void
    {
        [$user, $event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_COMPLETED,
            paymentConfirmed: false
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($event, $participant))
            ->assertNotFound();
    }

    public function test_paid_event_pending_registration_cannot_download_the_invoice(): void
    {
        [$user, $event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_PENDING,
            paymentConfirmed: false
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($event, $participant))
            ->assertNotFound();
    }

    public function test_free_event_does_not_expose_an_invoice(): void
    {
        [$user, $event, $participant] = $this->registration(
            price: 0,
            status: EventParticipant::STATUS_COMPLETED,
            paymentConfirmed: false
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($event, $participant))
            ->assertNotFound();
    }

    public function test_third_party_user_cannot_download_another_participant_invoice(): void
    {
        [, $event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_COMPLETED,
            paymentConfirmed: true
        );
        $otherUser = User::factory()->create(['role' => 'client']);

        $this->actingAs($otherUser)
            ->get($this->invoiceUrl($event, $participant))
            ->assertForbidden();
    }

    public function test_authorized_guest_can_download_the_invoice_via_session(): void
    {
        [, $event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_COMPLETED,
            paymentConfirmed: true,
            withUser: false
        );
        $this->fakePdfDownload();

        $this->withSession(['temp_participant_'.$participant->id => true])
            ->get($this->invoiceUrl($event, $participant))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_guest_without_authorized_session_cannot_download_the_invoice(): void
    {
        [, $event, $participant] = $this->registration(
            price: 100,
            status: EventParticipant::STATUS_COMPLETED,
            paymentConfirmed: true,
            withUser: false
        );

        $this->get($this->invoiceUrl($event, $participant))
            ->assertForbidden();
    }

    private function registration(
        float $price,
        string $status,
        bool $paymentConfirmed,
        bool $withUser = true
    ): array {
        $user = $withUser ? User::factory()->create(['role' => 'client']) : null;
        $owner = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Facture',
            'slug' => 'facture-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement facture',
            'slug' => 'event-facture-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $owner->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
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

        return [$user, $event, $participant];
    }

    private function invoiceUrl(Event $event, EventParticipant $participant): string
    {
        return route('evenements.facture.download', [$event->slug, $participant->reference]);
    }

    private function fakePdfDownload(): void
    {
        Pdf::shouldReceive('loadView')->once()->andReturnSelf();
        Pdf::shouldReceive('setPaper')->once()->andReturnSelf();
        Pdf::shouldReceive('setWarnings')->once()->andReturnSelf();
        Pdf::shouldReceive('download')->once()->andReturn(
            response('%PDF-1.4 fake', 200, ['Content-Type' => 'application/pdf'])
        );
    }
}
