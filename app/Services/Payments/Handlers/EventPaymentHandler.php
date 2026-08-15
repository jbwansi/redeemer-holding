<?php

namespace App\Services\Payments\Handlers;

use App\Models\EventParticipant;
use App\Notifications\InvoiceNotification;
use App\Services\OwnedResourceAccessService;
use App\Services\PaymentAmountService;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use App\Services\Payments\StripeCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class EventPaymentHandler implements PaymentHandlerInterface
{
    public function show(string $slug, int $participantId)
    {
        return $this->process($slug, $participantId);
    }

    public function process(string $slug, int $participantId)
    {
        $event = \App\Models\Event::where('slug', $slug)->published()->firstOrFail();
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

            abort(400, 'Cette inscription ne peut pas être payée actuellement.');
        }

        $amounts = app(PaymentAmountService::class)->calculate($event->price * $participant->qty);
        ['subtotal' => $subtotal, 'serviceFee' => $serviceFee, 'total' => $total] = $amounts;

        try {
            $session = app(StripeCheckoutService::class)->createSession([
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
                'success_url' => route('events.payment.success').'?session_id={CHECKOUT_SESSION_ID}',
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
            'payment_error' => null,
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
        $sessionId = $request->string('session_id')->toString();

        if ($sessionId === '' || $sessionId === '{CHECKOUT_SESSION_ID}') {
            return redirect()->route('evenements')
                ->with('error', 'Session de paiement invalide.');
        }

        try {
            $session = app(StripeCheckoutService::class)->retrieveSession($sessionId);

            if (($session->payment_status ?? null) !== 'paid') {
                throw new \RuntimeException("Le paiement n'a pas été confirmé par Stripe.");
            }

            $participant = EventParticipant::with('event')
                ->findOrFail($session->client_reference_id ?? null);

            if ($participant->stripe_session_id !== ($session->id ?? null)) {
                abort(404);
            }

            $this->assertExpectedAmount($participant, (int) ($session->amount_total ?? 0));

            if ($this->markAsPaid(
                $participant,
                (string) $session->payment_intent,
                (int) $session->amount_total
            )) {
                $this->sendInvoice($participant);
            }

            return redirect()->route('events.registration.confirmation', [
                'slug' => $participant->event->slug,
                'participant_id' => $participant->id,
            ])->with('success', 'Votre paiement a été effectué avec succès !');
        } catch (HttpExceptionInterface $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            Log::error('Erreur lors de la vérification du paiement événement.', [
                'session_id' => $sessionId,
                'message' => $exception->getMessage(),
            ]);

            return redirect()->route('evenements')
                ->with('error', "Une erreur s'est produite lors de la vérification du paiement. Veuillez nous contacter si vous avez été débité.");
        }
    }

    public function cancel(Request $request)
    {
        $participant = EventParticipant::with('event')->find($request->get('participant_id'));

        if ($participant) {
            app(OwnedResourceAccessService::class)->authorize($participant, 'update');
        }

        if ($participant?->status === EventParticipant::STATUS_IN_PROGRESS) {
            $participant->update([
                'status' => EventParticipant::STATUS_PENDING,
            ]);
        }

        if ($participant?->event) {
            return redirect()->route('evenements.details', $participant->event->slug)
                ->with('info', 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.');
        }

        return redirect()->route('evenements')
            ->with('info', 'Votre paiement a été annulé.');
    }

    public function handleCheckoutSessionCompleted($session): void
    {
        $participantId = $session->client_reference_id
            ?? $session->metadata->participant_id
            ?? null;

        $participant = EventParticipant::with('event')->find($participantId);

        if (! $participant || ($session->payment_status ?? null) !== 'paid') {
            return;
        }

        if ($participant->stripe_session_id !== ($session->id ?? null)) {
            Log::warning('Session Stripe événement non liée à l’inscription.', [
                'participant_id' => $participant->id,
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        try {
            $this->assertExpectedAmount($participant, (int) ($session->amount_total ?? 0));

            if ($this->markAsPaid(
                $participant,
                (string) $session->payment_intent,
                (int) $session->amount_total
            )) {
                $this->sendInvoice($participant);
            }
        } catch (\Throwable $exception) {
            Log::error('Finalisation webhook du paiement événement refusée.', [
                'participant_id' => $participant->id,
                'session_id' => $session->id ?? null,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;
        $eventId = $paymentIntent->metadata->event_id ?? null;
        $participant = EventParticipant::with('event')->find($participantId);

        if (! $participant || (string) $participant->event_id !== (string) $eventId) {
            return;
        }

        try {
            $amount = (int) ($paymentIntent->amount_received ?? $paymentIntent->amount ?? 0);
            $this->assertExpectedAmount($participant, $amount);

            if ($this->markAsPaid($participant, (string) $paymentIntent->id, $amount)) {
                $this->sendInvoice($participant);
            }
        } catch (\Throwable $exception) {
            Log::error('Finalisation PaymentIntent du paiement événement refusée.', [
                'participant_id' => $participant->id,
                'payment_intent_id' => $paymentIntent->id ?? null,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function handlePaymentFailed($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;
        $eventId = $paymentIntent->metadata->event_id ?? null;
        $participant = EventParticipant::find($participantId);

        if (! $participant
            || (string) $participant->event_id !== (string) $eventId
            || $participant->payment_confirmed
            || $participant->status === EventParticipant::STATUS_COMPLETED) {
            return;
        }

        $participant->update([
            'status' => EventParticipant::STATUS_PENDING,
            'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
        ]);
    }

    public function handleRefundUpdated($refund): void
    {
        $participantId = $refund->metadata->participant_id ?? null;
        $eventId = $refund->metadata->event_id ?? null;
        $participant = EventParticipant::find($participantId);

        if (! $participant
            || (string) $participant->event_id !== (string) $eventId
            || $participant->refund_id !== ($refund->id ?? null)) {
            return;
        }

        $participant->update([
            'refund_status' => $refund->status ?? $participant->refund_status,
            'refund_amount' => isset($refund->amount)
                ? ((int) $refund->amount) / 100
                : $participant->refund_amount,
            'refund_date' => $participant->refund_date ?? now(),
        ]);

        if (in_array($refund->status ?? null, ['failed', 'canceled'], true)) {
            Log::critical('Le remboursement d’un événement a échoué après annulation.', [
                'participant_id' => $participant->id,
                'refund_id' => $participant->refund_id,
                'refund_status' => $refund->status,
            ]);
        }
    }

    private function markAsPaid(
        EventParticipant $participant,
        string $paymentId,
        int $amountInCents
    ): bool {
        $updated = EventParticipant::query()
            ->whereKey($participant->id)
            ->where('payment_confirmed', false)
            ->update([
                'status' => EventParticipant::STATUS_COMPLETED,
                'payment_id' => $paymentId,
                'payment_amount' => $amountInCents / 100,
                'payment_date' => now(),
                'payment_confirmed' => true,
                'payment_error' => null,
            ]);

        if ($updated === 1) {
            $participant->refresh()->loadMissing('event');
        }

        return $updated === 1;
    }

    private function assertExpectedAmount(EventParticipant $participant, int $amountInCents): void
    {
        $amounts = app(PaymentAmountService::class)
            ->calculate($participant->event->price * $participant->qty);
        $expectedAmount = (int) round($amounts['total'] * 100);

        if ($amountInCents !== $expectedAmount) {
            throw new \RuntimeException('Le montant Stripe ne correspond pas au montant attendu.');
        }
    }

    private function sendInvoice(EventParticipant $participant): void
    {
        try {
            $event = $participant->event;
            $amounts = app(PaymentAmountService::class)->calculate($event->price * $participant->qty);

            $participant->notify(new InvoiceNotification($event, $participant, [
                'event' => $event,
                'registration' => $participant,
                ...$amounts,
                'date' => $participant->payment_date,
                'invoice_number' => 'FACT-'.date('Y').'-'.str_pad($participant->id, 6, '0', STR_PAD_LEFT),
            ]));
        } catch (\Throwable $exception) {
            Log::error('Paiement événement confirmé mais facture non envoyée.', [
                'participant_id' => $participant->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
