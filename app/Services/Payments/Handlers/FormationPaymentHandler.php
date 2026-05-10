<?php

namespace App\Services\Payments\Handlers;

use App\Models\Formation;
use App\Models\FormationParticipant;
use App\Notifications\FormationInvoiceNotification;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;

class FormationPaymentHandler implements PaymentHandlerInterface
{
    public function show(string $slug, int $participantId)
    {
        return $this->process($slug, $participantId);
    }

    public function process(string $slug, int $participantId)
    {
        $formation = Formation::where('slug', $slug)
            ->published()
            ->firstOrFail();

        $participant = FormationParticipant::findOrFail($participantId);

        if ($participant->formation_id !== $formation->id) {
            abort(404);
        }

        $this->authorizeAccess($participant);

        if ($participant->status !== FormationParticipant::STATUS_PENDING) {
            if ($participant->status === FormationParticipant::STATUS_COMPLETED) {
                return redirect()->route('formations.registration.confirmation', [
                    'slug' => $formation->slug,
                    'participant_id' => $participant->id,
                ])->with('error', 'Cette formation a déjà été payée.');
            }

            abort(400, "Cette inscription ne peut pas être payée actuellement.");
        }

        $subtotal = $formation->price * $participant->qty;
        $serviceFee = $subtotal * 0.05;
        $total = $subtotal + $serviceFee;

        try {
            $session = StripeSession::create([
                'payment_method_types' => ['card'],

                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'chf',
                            'product_data' => [
                                'name' => $formation->title,
                                'description' => "Places: {$participant->qty}",
                                'images' => $formation->featured_image
                                    ? [$formation->featured_image['original']]
                                    : [],
                            ],
                            'unit_amount' => round($formation->price * 100),
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
                    'payment_type' => 'formation',
                    'participant_id' => $participant->id,
                    'formation_id' => $formation->id,
                    'formation_title' => $formation->title,
                    'qty' => $participant->qty,
                ],

                'payment_intent_data' => [
                    'metadata' => [
                        'payment_type' => 'formation',
                        'participant_id' => $participant->id,
                        'formation_id' => $formation->id,
                    ],
                ],

                'mode' => 'payment',

                'success_url' => route('formations.payment.success')
                    . '?session_id={CHECKOUT_SESSION_ID}',

                'cancel_url' => route('formations.payment.cancel', [
                    'participant_id' => $participant->id,
                ]),
            ]);

            $participant->update([
                'status' => FormationParticipant::STATUS_IN_PROGRESS,
                'stripe_session_id' => $session->id,
            ]);

            return inertia('frontend/formations/payment', [
                'formation' => $formation,
                'participant' => $participant,
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'checkoutUrl' => $session->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Erreur Stripe lors de la création de la session de formation.', [
                'message' => $e->getMessage(),
                'formation_id' => $formation->id,
                'participant_id' => $participant->id,
            ]);

            return redirect()->route('formations.details', $formation->slug)
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

            $participant = FormationParticipant::with('formation')
                ->findOrFail($session->client_reference_id);

            $formation = $participant->formation;

            $this->markAsPaid($participant, $session);
            $this->sendInvoice($formation, $participant);

            return redirect()->route('formations.registration.confirmation', [
                'slug' => $formation->slug,
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
            $participant = FormationParticipant::with('formation')->find($participantId);

            if ($participant) {
                if ($participant->status === FormationParticipant::STATUS_IN_PROGRESS) {
                    $participant->update([
                        'status' => FormationParticipant::STATUS_PENDING,
                    ]);
                }

                return redirect()->route('formations.details', $participant->formation->slug)
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

        $participant = FormationParticipant::with('formation')->find($participantId);

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
                $this->sendInvoice($participant->formation, $participant);
            }
        }
    }

    public function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $participantId = $paymentIntent->metadata->participant_id ?? null;

        if (!$participantId) {
            return;
        }

        $participant = FormationParticipant::find($participantId);

        if ($participant) {
            $participant->update([
                'status' => FormationParticipant::STATUS_COMPLETED,
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

        $participant = FormationParticipant::find($participantId);

        if (!$participant) {
            return;
        }

        $participant->update([
            'status' => FormationParticipant::STATUS_PENDING,
            'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
        ]);
    }

    private function authorizeAccess(FormationParticipant $participant): void
    {
        if (auth()->check()) {
            if (
                $participant->user_id !== auth()->id()
                && !auth()->user()->hasRole('admin')
            ) {
                abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
            }

            return;
        }

        if (!session()->has('temp_participant_' . $participant->id)) {
            abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
        }
    }

    private function markAsPaid(FormationParticipant $participant, $session): void
    {
        if ($participant->status === FormationParticipant::STATUS_COMPLETED) {
            return;
        }

        $participant->update([
            'status' => FormationParticipant::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
            'payment_confirmed' => true,
        ]);
    }

    private function sendInvoice(Formation $formation, FormationParticipant $participant): void
    {
        $invoiceData = [
            'formation' => $formation,
            'registration' => $participant,
            'subtotal' => $formation->price * $participant->qty,
            'serviceFee' => $formation->price * $participant->qty * 0.05,
            'total' => $formation->price * $participant->qty * 1.05,
            'date' => $participant->payment_date ?? $participant->created_at,
            'invoice_number' => 'FORM-' . date('Y') . '-' . str_pad($participant->id, 6, '0', STR_PAD_LEFT),
        ];

        $participant->notify(
            new FormationInvoiceNotification($formation, $participant, $invoiceData)
        );
    }
}