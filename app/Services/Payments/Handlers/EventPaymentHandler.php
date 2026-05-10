<?php

namespace App\Services\Payments\Handlers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Notifications\InvoiceNotification;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;

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

        if ($participant->status !== EventParticipant::STATUS_PENDING) {
            if ($participant->status === EventParticipant::STATUS_COMPLETED) {
                return redirect()->route('events.registration.confirmation', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id,
                ]);
            }

            abort(400);
        }

        $subtotal = $event->price * $participant->qty;
        $serviceFee = $subtotal * 0.05;
        $total = $subtotal + $serviceFee;

        $session = StripeSession::create([
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

        $participant->update([
            'status' => EventParticipant::STATUS_IN_PROGRESS,
            'stripe_session_id' => $session->id,
        ]);

        return inertia('frontend/events/payment', [
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
        $event = $participant->event;

        $participant->update([
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
        ]);

        $participant->notify(new InvoiceNotification($event, $participant, [
            'event' => $event,
            'registration' => $participant,
            'subtotal' => $event->price * $participant->qty,
            'serviceFee' => $event->price * $participant->qty * 0.05,
            'total' => $event->price * $participant->qty * 1.05,
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

        if ($participant && $participant->status === EventParticipant::STATUS_IN_PROGRESS) {
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

        $participant->update([
            'status' => EventParticipant::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
        ]);
    }
}