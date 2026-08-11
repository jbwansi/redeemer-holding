<?php

namespace App\Services\Payments\Handlers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Notifications\InvoiceNotification;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use App\Services\OwnedResourceAccessService;
use App\Services\PaymentAmountService;
use App\Services\Payments\StripeCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;

class EventPaymentHandler implements PaymentHandlerInterface
{
    public function show(string $slug, int $participantId)
    {
        return $this->process($slug, $participantId);
    }

    public function process(string $slug, int $participantId)
    {
        $event = Event::where('slug', $slug)->published()->firstOrFail();
        $participant = EventParticipant::findOrFail($participantId);

        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        app(OwnedResourceAccessService::class)->authorize($participant);

        if ($participant->status !== EventParticipant::STATUS_PENDING) {
            if ($participant->status === EventParticipant::STATUS_COMPLETED) {
                return redirect()->route('events.registration.confirmation', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id,
                ]);
            }

            abort(400);
        }

        $amounts = app(PaymentAmountService::class)->calculate($event->price * $participant->qty);
        ['subtotal' => $subtotal, 'serviceFee' => $serviceFee, 'total' => $total] = $amounts;

        try {
            $session = app(StripeCheckoutService::class)->createSession([
            'payment_method_types' => ['card'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'chf',
                        'product_data' => [
                            'name' => $event->title,
                            'description' => "Places: {$participant->qty}",
                        ],
                        'unit_amount' => round($event->price * 100),
                    ],
                    'quantity' => $participant->qty,
                ],
                [
                    'price_data' => [
                        'currency' => 'chf',
                        'product_data' => [
                            'name' => 'Frais de service',
                            'description' => '5% du total',
                        ],
                        'unit_amount' => round($serviceFee * 100),
                    ],
                    'quantity' => 1,
                ],
            ],
            'customer_email' => $participant->email,
            'client_reference_id' => $participant->id,
            'metadata' => [
                'payment_type' => 'event',
                'participant_id' => $participant->id,
                'event_id' => $event->id,
            ],
            'mode' => 'payment',
            'success_url' => route('events.payment.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('events.payment.cancel', [
                'participant_id' => $participant->id,
            ]),
            ]);
        } catch (ApiErrorException $exception) {
            Log::error('Erreur Stripe lors de la création de la session événement.', [
                'operation' => 'stripe_checkout_create',
                'resource_type' => EventParticipant::class,
                'resource_id' => $participant->id,
                'event_id' => $event->id,
                'user_id' => $participant->user_id,
                'exception' => $exception,
            ]);

            return redirect()->route('evenements.details', $event->slug)
                ->with('error', "Une erreur s'est produite lors de la préparation du paiement. Veuillez réessayer.");
        }

        $participant->update([
            'status' => EventParticipant::STATUS_IN_PROGRESS,
            'stripe_session_id' => $session->id,
        ]);

        return inertia('Frontend/events/payment', [
            'event' => $event,
            'participant' => $participant,
            'subtotal' => $subtotal,
            'serviceFee' => $serviceFee,
            'total' => $total,
            'checkoutUrl' => $session->url,
        ]);
    }

    public function success(Request $request)
    {
        $session = StripeSession::retrieve($request->get('session_id'));

        if ($session->payment_status !== 'paid') {
            abort(400);
        }

        $participant = EventParticipant::with('event')->findOrFail($session->client_reference_id);
        if ($participant->stripe_session_id !== $session->id) {
            abort(404);
        }
        $event = $participant->event;

        if ($participant->status === EventParticipant::STATUS_COMPLETED) {
            return redirect()->route('events.registration.confirmation', [
                'slug' => $event->slug,
                'participant_id' => $participant->id,
            ]);
        }

        $participant->update([
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
        ]);

        $amounts = app(PaymentAmountService::class)->calculate($event->price * $participant->qty);

        $participant->notify(new InvoiceNotification($event, $participant, [
            'event' => $event,
            'registration' => $participant,
            ...$amounts,
            'date' => $participant->payment_date,
            'invoice_number' => 'FACT-' . date('Y') . '-' . str_pad($participant->id, 6, '0', STR_PAD_LEFT),
        ]));

        return redirect()->route('events.registration.confirmation', [
            'slug' => $event->slug,
            'participant_id' => $participant->id,
        ])->with('success', 'Votre paiement a été effectué avec succès !');
    }

    public function cancel(Request $request)
    {
        $participant = EventParticipant::find($request->get('participant_id'));

        if ($participant) {
            app(OwnedResourceAccessService::class)->authorize($participant, 'update');
        }

        if ($participant?->status === EventParticipant::STATUS_IN_PROGRESS) {
            $participant->update([
                'status' => EventParticipant::STATUS_PENDING,
            ]);
        }

        return redirect()->route('evenements')
            ->with('info', 'Votre paiement a été annulé.');
    }

    public function handleCheckoutSessionCompleted($session): void
    {
        $participant = EventParticipant::find($session->client_reference_id);

        if (!$participant || $session->payment_status !== 'paid') {
            return;
        }

        if ($participant->status === EventParticipant::STATUS_COMPLETED) {
            return;
        }

        if ($participant->stripe_session_id !== ($session->id ?? null)) {
            Log::warning('Session Stripe événement non liée à l’inscription.', [
                'participant_id' => $participant->id,
                'session_id' => $session->id ?? null,
            ]);
            return;
        }

        $participant->update([
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
        ]);
    }

}
