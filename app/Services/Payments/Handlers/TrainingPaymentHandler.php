<?php

namespace App\Services\Payments\Handlers;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Notifications\TrainingInvoiceNotification;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use App\Services\OwnedResourceAccessService;
use App\Services\PaymentAmountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
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

        try {
            $session = StripeSession::create([
                'payment_method_types' => ['card'],

                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'chf',
                            'product_data' => [
                                'name' => $training->title,
                                'description' => "Places: {$participant->qty}",
                                'images' => $training->featured_image
                                    ? [$training->featured_image['original']]
                                    : [],
                            ],
                            'unit_amount' => round($training->price * 100),
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
                    'payment_type' => 'training',
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'training_title' => $training->title,
                    'qty' => $participant->qty,
                ],

                'payment_intent_data' => [
                    'metadata' => [
                        'payment_type' => 'training',
                        'participant_id' => $participant->id,
                        'training_id' => $training->id,
                    ],
                ],

                'mode' => 'payment',

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
            $session = StripeSession::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {
                throw new \Exception("Le paiement n'a pas été effectué.");
            }

            $participant = TrainingParticipant::with('training')
                ->findOrFail($session->client_reference_id);

            $training = $participant->training;

            $this->markAsPaid($participant, $session);
            $this->sendInvoice($training, $participant);

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

        if (!$participantId) {
            Log::error('ID participant manquant dans la session Stripe formation.', [
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        $participant = TrainingParticipant::with('training')->find($participantId);

        if (!$participant) {
            Log::error('Participant formation introuvable.', [
                'participant_id' => $participantId,
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        if ($session->payment_status === 'paid') {
            $this->markAsPaid($participant, $session);

            // Optionnel : éviter double envoi si success() a déjà envoyé la facture.
            if (!$participant->wasRecentlyCreated) {
                $this->sendInvoice($participant->training, $participant);
            }
        }
    }

    public function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;

        if (!$participantId) {
            return;
        }

        $participant = TrainingParticipant::find($participantId);

        if ($participant) {
            $participant->update([
                'status' => TrainingParticipant::STATUS_COMPLETED,
                'payment_confirmed' => true,
            ]);
        }
    }

    public function handlePaymentFailed($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;

        if (!$participantId) {
            return;
        }

        $participant = TrainingParticipant::find($participantId);

        if (!$participant) {
            return;
        }

        $participant->update([
            'status' => TrainingParticipant::STATUS_PENDING,
            'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
        ]);
    }

    private function markAsPaid(TrainingParticipant $participant, $session): void
    {
        if ($participant->status === TrainingParticipant::STATUS_COMPLETED) {
            return;
        }

        $participant->update([
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
            'payment_confirmed' => true,
        ]);
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

