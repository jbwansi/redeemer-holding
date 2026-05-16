<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Notifications\TrainingInvoiceNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Webhook;

class TrainingPaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function showPaymentForm($slug, $participant_id)
    {
        $training = Training::where('slug', $slug)->published()->firstOrFail();
        $participant = TrainingParticipant::findOrFail($participant_id);

        if ($participant->training_id !== $training->id) {
            abort(404);
        }

        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
        }

        if ($participant->status !== TrainingParticipant::STATUS_PENDING) {
            if ($participant->status === TrainingParticipant::STATUS_COMPLETED) {
                return redirect()->route('trainings.registration.confirmation', [
                    'slug' => $training->slug,
                    'participant_id' => $participant->id
                ])->with('error', 'Ce training a déjà été payé.');
            }

            abort(400, "Cette inscription ne peut pas être payée actuellement.");
        }

        $subtotal = $training->price * $participant->qty;
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
                                'name' => $training->title,
                                'description' => "Places: {$participant->qty}",
                                'images' => $training->featured_image ? [$training->featured_image['original']] : [],
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
                    ]
                ],
                'customer_email' => $participant->email,
                'client_reference_id' => $participant->id,
                'metadata' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'training_title' => $training->title,
                    'qty' => $participant->qty,
                ],
                'mode' => 'payment',
                'success_url' => route('trainings.payment.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('trainings.payment.cancel', ['participant_id' => $participant->id]),
            ]);

            $participant->update([
                'status' => TrainingParticipant::STATUS_IN_PROGRESS,
                'stripe_session_id' => $checkoutSession->id,
            ]);

            return inertia('Frontend/trainings/payment', [
                'training' => $training,
                'participant' => $participant,
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'checkoutUrl' => $checkoutSession->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Erreur Stripe lors de la création de la session de formation:', [
                'message' => $e->getMessage(),
                'training_id' => $training->id,
                'participant_id' => $participant->id
            ]);

            return redirect()->route('formations.details', $training->slug)
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
            $participant = TrainingParticipant::with('training')->findOrFail($participantId);
            $training = $participant->training;

            $participant->update([
                'status' => TrainingParticipant::STATUS_COMPLETED,
                'payment_id' => $session->payment_intent,
                'payment_amount' => $session->amount_total / 100,
                'payment_date' => now(),
            ]);

            $invoiceData = [
                'training' => $training,
                'registration' => $participant,
                'subtotal' => $training->price * $participant->qty,
                'serviceFee' => $training->price * $participant->qty * 0.05,
                'total' => $training->price * $participant->qty * 1.05,
                'date' => $participant->payment_date ?? $participant->created_at,
                'invoice_number' => 'TRAI-' . date('Y') . '-' . str_pad($participant->id, 6, '0', STR_PAD_LEFT)
            ];

            $participant->notify(new TrainingInvoiceNotification($training, $participant, $invoiceData));

            return redirect()->route('trainings.registration.confirmation', [
                'slug' => $participant->training->slug,
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
            $participant = TrainingParticipant::find($participantId);

            if ($participant) {
                if ($participant->status === TrainingParticipant::STATUS_IN_PROGRESS) {
                    $participant->update([
                        'status' => TrainingParticipant::STATUS_PENDING
                    ]);
                }

                return redirect()->route('formations.details', $participant->training->slug)
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

        $participant = TrainingParticipant::find($participantId);

        if (!$participant) {
            Log::error('Participant à la formation introuvable', [
                'participant_id' => $participantId,
                'session_id' => $session->id
            ]);
            return;
        }

        if ($session->payment_status === 'paid') {
            $participant->update([
                'status' => TrainingParticipant::STATUS_COMPLETED,
                'payment_id' => $session->payment_intent,
                'payment_amount' => $session->amount_total / 100,
                'payment_date' => now(),
            ]);
        }
    }

    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        $participant = TrainingParticipant::where('payment_id', $paymentIntent->id)->first();

        if ($participant) {
            $participant->update([
                'status' => TrainingParticipant::STATUS_COMPLETED,
                'payment_confirmed' => true,
            ]);
        }
    }

    private function handlePaymentFailed($paymentIntent)
    {
        $participants = TrainingParticipant::where('payment_id', $paymentIntent->id)
            ->orWhere('stripe_session_id', $paymentIntent->metadata->checkout_session_id ?? '')
            ->get();

        foreach ($participants as $participant) {
            $participant->update([
                'status' => TrainingParticipant::STATUS_PENDING,
                'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
            ]);
        }
    }
}


