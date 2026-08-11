<?php

namespace Tests\Feature;

use App\Models\TrainingParticipant;
use App\Models\Training;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\Payments\Handlers\TrainingPaymentHandler;
use App\Services\Payments\PaymentManager;
use App\Services\Payments\StripeCheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Mockery;
use Stripe\Exception\ApiConnectionException;
use Tests\TestCase;

class PaymentHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_stripe_webhook_without_a_valid_signature_is_rejected(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test_only']);

        $request = Request::create('/stripe/webhook', 'POST', [], [], [], [], '{}');
        $request->headers->set('Stripe-Signature', 'invalid');

        $this->assertSame(400, app(PaymentManager::class)->webhook($request)->getStatusCode());
    }

    public function test_stripe_webhook_is_rejected_when_production_secret_is_missing(): void
    {
        config(['services.stripe.webhook_secret' => null]);

        $request = Request::create('/stripe/webhook', 'POST', [], [], [], [], '{}');

        $this->assertSame(400, app(PaymentManager::class)->webhook($request)->getStatusCode());
    }

    public function test_failed_payment_event_cannot_regress_a_completed_training(): void
    {
        $training = Training::query()->create([
            'title' => 'Formation test',
            'slug' => 'formation-test',
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'price' => 100,
        ]);

        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Test',
            'email' => 'test@example.com',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_id' => 'pi_completed',
            'payment_confirmed' => true,
        ]);

        $intent = (object) [
            'metadata' => (object) ['participant_id' => $participant->id],
            'last_payment_error' => (object) ['message' => 'declined'],
        ];

        app(TrainingPaymentHandler::class)->handlePaymentFailed($intent);

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_id' => 'pi_completed',
        ]);
    }

    public function test_event_stripe_creation_failure_is_controlled_without_status_transition(): void
    {
        $user = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Test', 'slug' => 'test', 'color' => '#000000',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement test', 'slug' => 'evenement-test',
            'description' => 'Description', 'content' => 'Contenu', 'location' => 'Lausanne',
            'category_id' => $categoryId, 'user_id' => $user->id,
            'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
            'price' => 100, 'is_published' => true, 'published_at' => now(),
        ]);
        $participant = EventParticipant::query()->create([
            'user_id' => $user->id, 'event_id' => $event->id, 'name' => 'Test',
            'email' => 'owner@example.com', 'qty' => 1,
            'status' => EventParticipant::STATUS_PENDING,
        ]);

        $stripe = Mockery::mock(StripeCheckoutService::class);
        $stripe->shouldReceive('createSession')->once()
            ->andThrow(ApiConnectionException::factory('Stripe unavailable'));
        $this->app->instance(StripeCheckoutService::class, $stripe);

        $this->actingAs($user);
        $response = app(\App\Services\Payments\Handlers\EventPaymentHandler::class)
            ->process($event->slug, $participant->id);

        $this->assertSame(route('evenements.details', $event->slug), $response->getTargetUrl());
        $this->assertTrue(session()->has('error'));

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'status' => EventParticipant::STATUS_PENDING,
            'stripe_session_id' => null,
        ]);
    }
}
