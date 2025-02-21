<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\FormationParticipant;
use App\Notifications\FormationInvoiceNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Webhook;

class FormationPaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function showPaymentForm($slug, $participant_id)
    {
        $formation = Formation::where('slug', $slug)->published()->firstOrFail();
        $participant = FormationParticipant::findOrFail($participant_id);

        if ($participant->formation_id !== $formation->id) {
            abort(404);
        }

        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
        }

        if ($participant->status !== FormationParticipant::STATUS_PENDING) {
            if ($participant->status === FormationParticipant::STATUS_COMPLETED) {
                return redirect()->route('formations.registration.confirmation', [
                    'slug' => $formation->slug,
                    'participant_id' => $participant->id
                ])->with('error', 'Cette formation a déjà été payée.');
            }

            abort(400, "Cette inscription ne peut pas être payée actuellement.");
        }

        $subtotal = $formation->price * $participant->qty;
        $serviceFee = $subtotal * 0.05;
        $total = $subtotal + $serviceFee;

        try {
            $checkoutSession = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'chf',
                            'product_data' => [
                                'name' => $formation->title,
                                'description' => "Places: {$participant->qty}",
                                'images' => $formation->featured_image ? [$formation->featured_image['original']] : [],
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
                    ]
                ],
                'customer_email' => $participant->email,
                'client_reference_id' => $participant->id,
                'metadata' => [
                    'participant_id' => $participant->id,
                    'formation_id' => $formation->id,
                    'formation_title' => $formation->title,
                    'qty' => $participant->qty,
                ],
                'mode' => 'payment',
                'success_url' => route('formations.payment.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('formations.payment.cancel', ['participant_id' => $participant->id]),
            ]);

            $participant->update([
                'status' => FormationParticipant::STATUS_IN_PROGRESS,
                'stripe_session_id' => $checkoutSession->id,
            ]);

            return inertia('frontend/formations/payment', [
                'formation' => $formation,
                'participant' => $participant,
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'checkoutUrl' => $checkoutSession->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Erreur Stripe lors de la création de la session de formation:', [
                'message' => $e->getMessage(),
                'formation_id' => $formation->id,
                'participant_id' => $participant->id
            ]);

            return redirect()->route('formations.details', $formation->slug)
                ->with('error', "Une erreur s'est produite lors de la préparation du paiement. Veuillez réessayer.");
        }
    }

    public function handleSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId || $sessionId === '{CHECKOUT_SESSION_ID}') {
            Log::alert("Session de formation annulée");
            return redirect()->route('formations')->with('error', "Session de paiement invalide.");
        }

        try {
            $session = StripeSession::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {
                throw new \Exception("Le paiement n'a pas été effectué.");
            }

            $participantId = $session->client_reference_id;
            $participant = FormationParticipant::with('formation')->findOrFail($participantId);
            $formation = $participant->formation;

            $participant->update([
                'status' => FormationParticipant::STATUS_COMPLETED,
                'payment_id' => $session->payment_intent,
                'payment_amount' => $session->amount_total / 100,
                'payment_date' => now(),
            ]);

            $invoiceData = [
                'formation' => $formation,
                'registration' => $participant,
                'subtotal' => $formation->price * $participant->qty,
                'serviceFee' => $formation->price * $participant->qty * 0.05,
                'total' => $formation->price * $participant->qty * 1.05,
                'date' => $participant->payment_date ?? $participant->created_at,
                'invoice_number' => 'FORM-' . date('Y') . '-' . str_pad($participant->id, 6, '0', STR_PAD_LEFT)
            ];

            $participant->notify(new FormationInvoiceNotification($formation, $participant, $invoiceData));

            return redirect()->route('formations.registration.confirmation', [
                'slug' => $participant->formation->slug,
                'participant_id' => $participant->id
            ])->with('success', 'Votre paiement a été effectué avec succès !');
        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification du paiement de la formation:', [
                'message' => $e->getMessage(),
                'session_id' => $sessionId
            ]);

            return redirect()->route('formations')
                ->with('error', "Une erreur s'est produite lors de la vérification du paiement. Veuillez nous contacter si vous avez été débité.");
        }
    }

    public function handleCancellation(Request $request)
    {
        $participantId = $request->get('participant_id');

        if ($participantId) {
            $participant = FormationParticipant::find($participantId);

            if ($participant) {
                if ($participant->status === FormationParticipant::STATUS_IN_PROGRESS) {
                    $participant->update([
                        'status' => FormationParticipant::STATUS_PENDING
                    ]);
                }

                return redirect()->route('formations.details', $participant->formation->slug)
                    ->with('info', 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.');
            }
        }

        return redirect()->route('formations')->with('info', 'Votre paiement a été annulé.');
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);

            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;

                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement du webhook Stripe pour la formation:', [
                'message' => $e->getMessage(),
                'event_type' => $event->type ?? 'inconnu'
            ]);

            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    private function handleCheckoutSessionCompleted($session)
    {
        $participantId = $session->client_reference_id;

        if (!$participantId) {
            Log::error('ID participant manquant dans la session Stripe de formation', [
                'session_id' => $session->id
            ]);
            return;
        }

        $participant = FormationParticipant::find($participantId);

        if (!$participant) {
            Log::error('Participant à la formation introuvable', [
                'participant_id' => $participantId,
                'session_id' => $session->id
            ]);
            return;
        }

        if ($session->payment_status === 'paid') {
            $participant->update([
                'status' => FormationParticipant::STATUS_COMPLETED,
                'payment_id' => $session->payment_intent,
                'payment_amount' => $session->amount_total / 100,
                'payment_date' => now(),
            ]);
        }
    }

    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        $participant = FormationParticipant::where('payment_id', $paymentIntent->id)->first();

        if ($participant) {
            $participant->update([
                'status' => FormationParticipant::STATUS_COMPLETED,
                'payment_confirmed' => true,
            ]);
        }
    }

    private function handlePaymentFailed($paymentIntent)
    {
        $participants = FormationParticipant::where('payment_id', $paymentIntent->id)
            ->orWhere('stripe_session_id', $paymentIntent->metadata->checkout_session_id ?? '')
            ->get();

        foreach ($participants as $participant) {
            $participant->update([
                'status' => FormationParticipant::STATUS_PENDING,
                'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
            ]);
        }
    }
}
