<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingInvoiceDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_paid_training_with_confirmed_payment_can_download_the_invoice(): void
    {
        [$user, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: true
        );
        $this->fakePdfDownload();

        $this->actingAs($user)
            ->get($this->invoiceUrl($training, $participant))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_paid_training_invoice_generates_a_real_pdf(): void
    {
        if (! extension_loaded('gd')) {
            $this->markTestSkipped('The GD extension is required for DomPDF to render the invoice logo.');
        }

        [$user, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: true
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($training, $participant))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertSee('%PDF');
    }

    public function test_paid_training_completed_but_not_payment_confirmed_cannot_download_the_invoice(): void
    {
        [$user, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: false
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($training, $participant))
            ->assertNotFound();
    }

    public function test_paid_training_pending_registration_cannot_download_the_invoice(): void
    {
        [$user, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_PENDING,
            paymentConfirmed: false
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($training, $participant))
            ->assertNotFound();
    }

    public function test_free_training_does_not_expose_an_invoice(): void
    {
        [$user, $training, $participant] = $this->registration(
            price: 0,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: false
        );

        $this->actingAs($user)
            ->get($this->invoiceUrl($training, $participant))
            ->assertNotFound();
    }

    public function test_third_party_user_cannot_download_another_participant_invoice(): void
    {
        [, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: true
        );
        $otherUser = User::factory()->create(['role' => 'client']);

        $this->actingAs($otherUser)
            ->get($this->invoiceUrl($training, $participant))
            ->assertForbidden();
    }

    public function test_authorized_guest_can_download_the_invoice_via_session(): void
    {
        [, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: true,
            withUser: false
        );
        $this->fakePdfDownload();

        $this->withSession(['temp_participant_'.$participant->id => true])
            ->get($this->invoiceUrl($training, $participant))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_guest_without_authorized_session_cannot_download_the_invoice(): void
    {
        [, $training, $participant] = $this->registration(
            price: 100,
            status: TrainingParticipant::STATUS_COMPLETED,
            paymentConfirmed: true,
            withUser: false
        );

        $this->get($this->invoiceUrl($training, $participant))
            ->assertForbidden();
    }

    private function registration(
        float $price,
        string $status,
        bool $paymentConfirmed,
        bool $withUser = true
    ): array {
        $user = $withUser ? User::factory()->create(['role' => 'client']) : null;
        $training = Training::query()->create([
            'title' => 'Formation facture',
            'slug' => 'formation-facture-'.uniqid(),
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => $price,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
        $participant = TrainingParticipant::query()->create([
            'user_id' => $user?->id,
            'training_id' => $training->id,
            'name' => 'Participant test',
            'email' => 'participant-'.uniqid().'@example.com',
            'qty' => 1,
            'status' => $status,
            'reference' => TrainingParticipant::generateReference(),
            'payment_confirmed' => $paymentConfirmed,
            'payment_id' => $paymentConfirmed ? 'pi_confirmed' : null,
            'payment_amount' => $paymentConfirmed ? 105 : null,
            'payment_date' => $paymentConfirmed ? now() : null,
        ]);

        return [$user, $training, $participant];
    }

    private function invoiceUrl(Training $training, TrainingParticipant $participant): string
    {
        return route('formations.facture.download', [$training->slug, $participant->reference]);
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
