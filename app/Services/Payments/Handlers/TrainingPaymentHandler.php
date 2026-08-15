<?php

namespace App\Services\Payments\Handlers;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Notifications\TrainingInvoiceNotification;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use App\Services\OwnedResourceAccessService;
use App\Services\PaymentAmountService;
use App\Services\Payments\StripeCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;

class TrainingPaymentHandler implements PaymentHandlerInterface
{
    public function show(string $slug, int $participantId)
    {
        return $this->process($slug, $participantId);
    }

    public function process(string $slug, int $participantId)
    {
        $training = Training::where('slug', $slug)
            ->published()
            ->firstOrFail();

        $participant = TrainingParticipant::findOrFail($participantId);

        if ($participant->training_id !== $training->id) {
            abort(404);
        }

        app(OwnedResourceAccessService::class)->authorize($participant);

        if ($participant->status !== TrainingParticipant::STATUS_PENDING) {
            if ($participant->status === TrainingParticipant::STATUS_COMPLETED) {
                return redirect()->route('trainings.registration.confirmation', [
                    'slug' => $training->slug,
                    'participant_id' => $participant->id,
                ])->with('error', 'Cette formation a déjà été payée.');
            }

            abort(400, "Cette inscription ne peut pas être payée actuellement.");
        }

        $amounts = app(PaymentAmountService::class)->calculate($training->price * $participant->qty);
        ['subtotal' => $subtotal, 'serviceFee' => $serviceFee, 'total' => $total] = $amounts;

        $checkout = app(StripeCheckoutService::class);

        try {
            $session = $checkout->createSession([
                'line_items' => [
                    $checkout->buildProductLineItem(
                        $training->title,
                        $training->price,
                        $participant->qty,
                        "Places: {$participant->qty}",
                        $training->featured_image ? [$training->featured_image['original']] : []
                    ),
                    $checkout->buildServiceFeeLineItem($serviceFee),
                ],

                'customer_email' => $participant->email,
                'client_reference_id' => $participant->id,

                'metadata' => [
                    'payment_type' => 'training',
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'training_title' => $training->title,
                    'qty' => $participant->qty,
                ],

                'success_url' => route('trainings.payment.success')
                    . '?session_id={CHECKOUT_SESSION_ID}',

                'cancel_url' => route('trainings.payment.cancel', [
                    'participant_id' => $participant->id,
                ]),
            ]);

            $participant->update([
                'status' => TrainingParticipant::STATUS_IN_PROGRESS,
                'stripe_session_id' => $session->id,
            ]);

            return inertia('Frontend/trainings/payment', [
                'training' => $training,
                'participant' => $participant,
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'checkoutUrl' => $session->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Erreur Stripe lors de la création de la session de formation.', [
                'message' => $e->getMessage(),
                'training_id' => $training->id,
                'participant_id' => $participant->id,
            ]);

            return redirect()->route('formations.details', $training->slug)
                ->with('error', "Une erreur s'est produite lors de la préparation du paiement. Veuillez réessayer.");
        }
    }

    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId || $sessionId === '{CHECKOUT_SESSION_ID}') {
            Log::warning('Session Stripe formation invalide.');

            return redirect()->route('formations')
                ->with('error', 'Session de paiement invalide.');
        }

        try {
            $session = app(StripeCheckoutService::class)->retrieveSession($sessionId);

            if ($session->payment_status !== 'paid') {
                throw new \Exception("Le paiement n'a pas été effectué.");
            }

            $paymentType = $session->metadata->payment_type ?? null;
            $metadataParticipantId = $session->metadata->participant_id ?? null;
            $trainingId = $session->metadata->training_id ?? null;

            if (! in_array($paymentType, ['training', 'formation'], true)) {
                throw new \RuntimeException('Le type de paiement Stripe est invalide.');
            }

            $participant = TrainingParticipant::with('training')
                ->findOrFail($session->client_reference_id);

            if ($participant->stripe_session_id !== $session->id) {
                abort(404);
            }

            $training = $participant->training;

            if ((string) $metadataParticipantId !== (string) $participant->id
                || (string) $trainingId !== (string) $participant->training_id) {
                throw new \RuntimeException('Les métadonnées Stripe ne correspondent pas à l’inscription.');
            }

            $this->assertExpectedAmount($participant, (int) ($session->amount_total ?? 0), $session->currency ?? null);

            if ($this->markAsPaid(
                $participant,
                (string) $session->payment_intent,
                (int) ($session->amount_total ?? 0)
            )) {
                $this->sendInvoice($training, $participant);
            }

            return redirect()->route('trainings.registration.confirmation', [
                'slug' => $training->slug,
                'participant_id' => $participant->id,
            ])->with('success', 'Votre paiement a été effectué avec succès !');
        } catch (\Throwable $e) {
            Log::error('Erreur lors de la vérification du paiement de la formation.', [
                'message' => $e->getMessage(),
                'session_id' => $sessionId,
            ]);

            return redirect()->route('formations')
                ->with('error', "Une erreur s'est produite lors de la vérification du paiement. Veuillez nous contacter si vous avez été débité.");
        }
    }

    public function cancel(Request $request)
    {
        $participantId = $request->get('participant_id');

        if ($participantId) {
            $participant = TrainingParticipant::with('training')->find($participantId);

            if ($participant) {
                app(OwnedResourceAccessService::class)->authorize($participant, 'update');

                $participant->update([
                    'status' => TrainingParticipant::STATUS_PENDING,
                ]);

                return redirect()->route('formations.details', $participant->training->slug)
                    ->with('info', 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.');
            }
        }

        return redirect()->route('formations')
            ->with('info', 'Votre paiement a été annulé.');
    }

    public function handleCheckoutSessionCompleted($session): void
    {
        $participantId = $session->client_reference_id
            ?? $session->metadata->participant_id
            ?? null;
        $trainingId = $session->metadata->training_id ?? null;
        $paymentType = $session->metadata->payment_type ?? null;

        if (! in_array($paymentType, ['training', 'formation'], true)) {
            Log::warning('Webhook Stripe formation avec payment_type inattendu.', [
                'session_id' => $session->id ?? null,
                'payment_type' => $paymentType,
            ]);

            return;
        }

        if (!$participantId) {
            Log::error('ID participant manquant dans la session Stripe formation.', [
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        $participant = TrainingParticipant::with('training')->find($participantId);

        if (!$participant || !$participant->training) {
            Log::error('Participant formation introuvable.', [
                'participant_id' => $participantId,
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        if ((string) $participant->training_id !== (string) $trainingId) {
            Log::warning('Formation Stripe non liée au participant.', [
                'participant_id' => $participant->id,
                'training_id' => $trainingId,
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        if ($session->payment_status !== 'paid') {
            return;
        }

        if ($participant->stripe_session_id !== ($session->id ?? null)) {
            Log::warning('Session Stripe formation non liée à l’inscription.', [
                'participant_id' => $participant->id,
                'session_id' => $session->id ?? null,
            ]);
            return;
        }

        try {
            $this->assertExpectedAmount($participant, (int) ($session->amount_total ?? 0), $session->currency ?? null);

            if ($this->markAsPaid(
                $participant,
                (string) $session->payment_intent,
                (int) ($session->amount_total ?? 0)
            )) {
                $this->sendInvoice($participant->training, $participant);
            }
        } catch (\Throwable $exception) {
            Log::error('Finalisation webhook du paiement formation refusée.', [
                'participant_id' => $participant->id,
                'session_id' => $session->id ?? null,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;
        $trainingId = $paymentIntent->metadata->training_id ?? null;
        $paymentType = $paymentIntent->metadata->payment_type ?? null;

        if (! in_array($paymentType, ['training', 'formation'], true)) {
            Log::warning('PaymentIntent formation avec payment_type inattendu.', [
                'payment_intent_id' => $paymentIntent->id ?? null,
                'payment_type' => $paymentType,
            ]);

            return;
        }

        if (!$participantId) {
            return;
        }

        $participant = TrainingParticipant::with('training')->find($participantId);

        if (!$participant || !$participant->training || (string) $participant->training_id !== (string) $trainingId) {
            Log::warning('PaymentIntent formation invalide : participant ou formation incohérents.', [
                'participant_id' => $participantId,
                'training_id' => $trainingId,
                'payment_intent_id' => $paymentIntent->id ?? null,
            ]);

            return;
        }

        try {
            $amount = (int) ($paymentIntent->amount_received ?? $paymentIntent->amount ?? 0);
            $this->assertExpectedAmount($participant, $amount, $paymentIntent->currency ?? null);

            if ($this->markAsPaid($participant, (string) $paymentIntent->id, $amount)) {
                $this->sendInvoice($participant->training, $participant);
            }
        } catch (\Throwable $exception) {
            Log::error('Finalisation PaymentIntent du paiement formation refusée.', [
                'participant_id' => $participant->id,
                'payment_intent_id' => $paymentIntent->id ?? null,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function handlePaymentFailed($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;
        $trainingId = $paymentIntent->metadata->training_id ?? null;
        $participant = TrainingParticipant::find($participantId);

        if (! $participant
            || (string) $participant->training_id !== (string) $trainingId
            || $participant->payment_confirmed
            || $participant->status === TrainingParticipant::STATUS_COMPLETED) {
            return;
        }

        $participant->update([
            'status' => TrainingParticipant::STATUS_PENDING,
            'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
        ]);
    }

    private function markAsPaid(TrainingParticipant $participant, string $paymentId, int $amountInCents): bool
    {
        $updated = TrainingParticipant::query()
            ->whereKey($participant->id)
            ->where('payment_confirmed', false)
            ->update([
                'status' => TrainingParticipant::STATUS_COMPLETED,
                'payment_id' => $paymentId,
                'payment_amount' => $amountInCents / 100,
                'payment_date' => now(),
                'payment_confirmed' => true,
                'payment_error' => null,
            ]);

        if ($updated === 1) {
            $participant->refresh()->loadMissing('training');
        }

        return $updated === 1;
    }

    private function assertExpectedAmount(TrainingParticipant $participant, int $amountInCents, ?string $currency = null): void
    {
        if ($currency !== null && strtolower($currency) !== 'chf') {
            throw new \RuntimeException('La devise Stripe ne correspond pas à la devise attendue.');
        }

        $amounts = app(PaymentAmountService::class)
            ->calculate($participant->training->price * $participant->qty);
        $expectedAmount = (int) round($amounts['total'] * 100);

        if ($amountInCents !== $expectedAmount) {
            throw new \RuntimeException('Le montant Stripe ne correspond pas au montant attendu.');
        }
    }

    private function sendInvoice(Training $training, TrainingParticipant $participant): void
    {
        $amounts = app(PaymentAmountService::class)->calculate($training->price * $participant->qty);

        $invoiceData = [
            'formation' => $training,
            'registration' => $participant,
            ...$amounts,
            'date' => $participant->payment_date ?? $participant->created_at,
            'invoice_number' => 'FORM-' . date('Y') . '-' . str_pad($participant->id, 6, '0', STR_PAD_LEFT),
        ];

        $participant->notify(
            new TrainingInvoiceNotification($training, $participant, $invoiceData)
        );
    }
}

