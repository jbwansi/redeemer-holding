<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Webhook;

class PaymentController extends Controller
{
    /**
     * Constructeur pour initialiser Stripe
     */
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Afficher le formulaire de paiement Stripe
     */
    public function showPaymentForm($slug, $participant_id)
    {
        $event = Event::where('slug', $slug)->published()->firstOrFail();
        $participant = EventParticipant::findOrFail($participant_id);

        // Vérifier que le participant appartient bien à cet événement
        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        // Vérifier les autorisations
        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
        }

        // Vérifier que l'inscription est en attente de paiement
        if ($participant->status !== EventParticipant::STATUS_PENDING) {
            if ($participant->status === EventParticipant::STATUS_COMPLETED) {
                return redirect()->route('events.registration.confirmation', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id
                ])->with('error', 'Cet événement a déjà été payé.');
            }

            abort(400, "Cette inscription ne peut pas être payée actuellement.");
        }

        // Calculer le montant total
        $subtotal = $event->price * $participant->qty;
        $serviceFee = $subtotal * 0.05; // 5% de frais de service
        $total = $subtotal + $serviceFee;

        // Créer la session Stripe Checkout
        try {
            $checkoutSession = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'chf',
                            'product_data' => [
                                'name' => $event->title,
                                'description' => "Places: {$participant->qty}",
                                'images' => $event->featured_image ? [$event->featured_image['original']] : [],
                            ],
                            'unit_amount' => round($event->price * 100), // Montant en centimes
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
                            'unit_amount' => round($serviceFee * 100), // Montant en centimes
                        ],
                        'quantity' => 1,
                    ]
                ],
                'customer_email' => $participant->email,
                'client_reference_id' => $participant->id,
                'metadata' => [
                    'participant_id' => $participant->id,
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'qty' => $participant->qty,
                ],
                'mode' => 'payment',
                'success_url' => route('events.payment.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('events.payment.cancel', ['participant_id' => $participant->id]),
            ]);

            // Mettre à jour le statut du participant
            $participant->update([
                'status' => EventParticipant::STATUS_IN_PROGRESS,
                'stripe_session_id' => $checkoutSession->id,
            ]);

            // Rediriger vers la page de paiement Stripe
            return inertia('frontend/events/payment', [
                'event' => $event,
                'participant' => $participant,
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'checkoutUrl' => $checkoutSession->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Erreur Stripe lors de la création de la session:', [
                'message' => $e->getMessage(),
                'event_id' => $event->id,
                'participant_id' => $participant->id
            ]);

            return redirect()->route('evenements.details', $event->slug)->with('error', "Une erreur s'est produite lors de la préparation du paiement. Veuillez réessayer.");
        }
    }

    /**
     * Gestion du succès de paiement
     */
    public function handleSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            Log::alert("Session annulé");
            return redirect()->route('evenements')->with('error', "Session de paiement invalide.");
        }

        try {
            // Récupérer la session Stripe
            $session = StripeSession::retrieve($sessionId);

            // Vérifier que la session est bien complétée
            if ($session->payment_status !== 'paid') {
                throw new \Exception("Le paiement n'a pas été effectué.");
            }

            // Récupérer le participant
            $participantId = $session->client_reference_id;
            $participant = EventParticipant::findOrFail($participantId);

            // Mettre à jour le statut du participant
            $participant->update([
                'status' => EventParticipant::STATUS_COMPLETED,
                'payment_id' => $session->payment_intent,
                'payment_amount' => $session->amount_total / 100, // Convertir les centimes en francs
                'payment_date' => now(),
            ]);

            // Envoyer un email de confirmation
            // ... logique d'envoi d'email

            // Rediriger vers la page de confirmation
            return redirect()->route('events.registration.confirmation', [
                'slug' => $participant->event->slug,
                'participant_id' => $participant->id
            ])->with('success', 'Votre paiement a été effectué avec succès !');
        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification du paiement:', [
                'message' => $e->getMessage(),
                'session_id' => $sessionId
            ]);

            Log::alert("Erreur de payement");
            return redirect()->route('evenements')->with('error', "Une erreur s'est produite lors de la vérification du paiement. Veuillez nous contacter si vous avez été débité.");
        }
    }

    /**
     * Gestion de l'annulation de paiement
     */
    public function handleCancellation(Request $request)
    {
        $participantId = $request->get('participant_id');

        if ($participantId) {
            $participant = EventParticipant::find($participantId);

            if ($participant) {
                // Mettre à jour le statut si le paiement a été annulé
                if ($participant->status === EventParticipant::STATUS_IN_PROGRESS) {
                    $participant->update([
                        'status' => EventParticipant::STATUS_PENDING
                    ]);
                }

                return redirect()->route('evenements.details', $participant->event->slug)
                    ->with('info', 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.');
            }
        }

        Log::alert("Payment annulé");

        return redirect()->route('evenements')->with('info', 'Votre paiement a été annulé.');
    }

    /**
     * Gestion des webhooks Stripe
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);

            // Gestion des différents événements Stripe
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
        } catch (\UnexpectedValueException $e) {
            // Signature invalide
            Log::error('Signature Stripe invalide:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Signature invalide'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Signature invalide
            Log::error('Signature Stripe invalide:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Signature invalide'], 400);
        } catch (\Exception $e) {
            // Autre erreur
            Log::error('Erreur lors du traitement du webhook Stripe:', [
                'message' => $e->getMessage(),
                'event_type' => $event->type ?? 'inconnu'
            ]);

            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Gestion de la complétion d'une session Checkout
     */
    private function handleCheckoutSessionCompleted($session)
    {
        $participantId = $session->client_reference_id;

        if (!$participantId) {
            Log::error('ID participant manquant dans la session Stripe', [
                'session_id' => $session->id
            ]);
            return;
        }

        $participant = EventParticipant::find($participantId);

        if (!$participant) {
            Log::error('Participant introuvable', [
                'participant_id' => $participantId,
                'session_id' => $session->id
            ]);
            return;
        }

        // Si le paiement est complet, mettre à jour le statut
        if ($session->payment_status === 'paid') {
            $participant->update([
                'status' => EventParticipant::STATUS_COMPLETED,
                'payment_id' => $session->payment_intent,
                'payment_amount' => $session->amount_total / 100,
                'payment_date' => now(),
            ]);

            // Envoyer un email de confirmation
            // ... logique d'envoi d'email
        }
    }

    /**
     * Gestion du succès d'un paiement
     */
    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        // Rechercher les participants associés à ce paiement
        $participant = EventParticipant::where('payment_id', $paymentIntent->id)->first();

        if ($participant) {
            $participant->update([
                'status' => EventParticipant::STATUS_COMPLETED,
                'payment_confirmed' => true,
            ]);
        }
    }

    /**
     * Gestion de l'échec d'un paiement
     */
    private function handlePaymentFailed($paymentIntent)
    {
        // Trouver les participants concernés par l'échec
        $participants = EventParticipant::where('payment_id', $paymentIntent->id)
            ->orWhere('stripe_session_id', $paymentIntent->metadata->checkout_session_id ?? '')
            ->get();

        foreach ($participants as $participant) {
            $participant->update([
                'status' => EventParticipant::STATUS_PENDING,
                'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
            ]);

            // Informer l'utilisateur de l'échec du paiement
            // ... logique d'envoi d'email
        }
    }
}
