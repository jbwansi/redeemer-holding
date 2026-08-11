<?php

namespace App\Services\Payments\Handlers;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Services\Payments\Contracts\PaymentHandlerInterface;
use App\Services\OwnedResourceAccessService;
use App\Services\PaymentAmountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;

class ServicePaymentHandler implements PaymentHandlerInterface
{
    public function show(string $slug, int $requestId)
    {
        return $this->process($slug, $requestId);
    }

    public function process(string $slug, int $requestId)
    {
        $service = Service::where('slug', $slug)->firstOrFail();
        $serviceRequest = ServiceRequest::findOrFail($requestId);

        if ($serviceRequest->service_id !== $service->id) {
            abort(404);
        }

        app(OwnedResourceAccessService::class)->authorize($serviceRequest);

        if ($serviceRequest->status !== ServiceRequest::STATUS_PENDING) {
            if ($serviceRequest->status === ServiceRequest::STATUS_COMPLETED) {
                return redirect()->route('services.details', $service->slug)
                    ->with('error', 'Cette demande de service a déjà été payée.');
            }

            abort(400, 'Cette demande ne peut pas être payée actuellement.');
        }

        $subtotal = $serviceRequest->amount ?? $service->price;
        $amounts = app(PaymentAmountService::class)->calculate($subtotal);
        ['serviceFee' => $serviceFee, 'total' => $total] = $amounts;

        try {
            $session = StripeSession::create([
                'payment_method_types' => ['card'],

                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'chf',
                            'product_data' => [
                                'name' => $service->title,
                                'description' => 'Paiement de service',
                            ],
                            'unit_amount' => round($subtotal * 100),
                        ],
                        'quantity' => 1,
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

                'customer_email' => $serviceRequest->email,
                'client_reference_id' => $serviceRequest->id,

                'metadata' => [
                    'payment_type' => 'service',
                    'request_id' => $serviceRequest->id,
                    'service_id' => $service->id,
                    'service_title' => $service->title,
                ],

                'payment_intent_data' => [
                    'metadata' => [
                        'payment_type' => 'service',
                        'request_id' => $serviceRequest->id,
                        'service_id' => $service->id,
                    ],
                ],

                'mode' => 'payment',

                'success_url' => route('services.payment.success')
                    . '?session_id={CHECKOUT_SESSION_ID}',

                'cancel_url' => route('services.payment.cancel', [
                    'request_id' => $serviceRequest->id,
                ]),
            ]);

            $serviceRequest->update([
                'status' => ServiceRequest::STATUS_IN_PROGRESS,
                'stripe_session_id' => $session->id,
            ]);

            return inertia('Frontend/services/payment', [
                'service' => $service,
                'serviceRequest' => $serviceRequest,
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'checkoutUrl' => $session->url,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Erreur Stripe paiement service.', [
                'message' => $e->getMessage(),
                'service_id' => $service->id,
                'request_id' => $serviceRequest->id,
            ]);

            return redirect()->route('services.details', $service->slug)
                ->with('error', "Une erreur s'est produite lors de la préparation du paiement.");
        }
    }

    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId || $sessionId === '{CHECKOUT_SESSION_ID}') {
            return redirect()->route('services')
                ->with('error', 'Session de paiement invalide.');
        }

        try {
            $session = StripeSession::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {
                throw new \Exception("Le paiement n'a pas été effectué.");
            }

            $serviceRequest = ServiceRequest::with('service')
                ->findOrFail($session->client_reference_id);

            if ($serviceRequest->stripe_session_id !== $session->id) {
                abort(404);
            }

            $this->markAsPaid($serviceRequest, $session);

            return redirect()->route('services.details', $serviceRequest->service->slug)
                ->with('success', 'Votre paiement a été effectué avec succès !');
        } catch (\Throwable $e) {
            Log::error('Erreur vérification paiement service.', [
                'message' => $e->getMessage(),
                'session_id' => $sessionId,
            ]);

            return redirect()->route('services')
                ->with('error', "Une erreur s'est produite lors de la vérification du paiement.");
        }
    }

    public function cancel(Request $request)
    {
        $requestId = $request->get('request_id');

        if ($requestId) {
            $serviceRequest = ServiceRequest::with('service')->find($requestId);

            if ($serviceRequest) {
                app(OwnedResourceAccessService::class)->authorize($serviceRequest, 'update');

                if ($serviceRequest->status === ServiceRequest::STATUS_IN_PROGRESS) {
                    $serviceRequest->update([
                        'status' => ServiceRequest::STATUS_PENDING,
                    ]);
                }

                return redirect()->route('services.details', $serviceRequest->service->slug)
                    ->with('info', 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.');
            }
        }

        return redirect()->route('services')
            ->with('info', 'Votre paiement a été annulé.');
    }

    public function handleCheckoutSessionCompleted($session): void
    {
        $requestId = $session->client_reference_id
            ?? $session->metadata->request_id
            ?? null;

        if (!$requestId) {
            Log::error('ID demande service manquant dans Stripe.', [
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        $serviceRequest = ServiceRequest::find($requestId);

        if (!$serviceRequest || $session->payment_status !== 'paid') {
            return;
        }

        if ($serviceRequest->stripe_session_id !== ($session->id ?? null)) {
            Log::warning('Session Stripe service non liée à la demande.', [
                'request_id' => $serviceRequest->id,
                'session_id' => $session->id ?? null,
            ]);
            return;
        }

        $this->markAsPaid($serviceRequest, $session);
    }

    public function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $requestId = $paymentIntent->metadata->request_id ?? null;

        if (!$requestId) {
            return;
        }

        $serviceRequest = ServiceRequest::find($requestId);

        if ($serviceRequest && $serviceRequest->status !== ServiceRequest::STATUS_COMPLETED) {
            $serviceRequest->update([
                'status' => ServiceRequest::STATUS_COMPLETED,
                'payment_confirmed' => true,
            ]);
        }
    }

    public function handlePaymentFailed($paymentIntent): void
    {
        $requestId = $paymentIntent->metadata->request_id ?? null;

        if (!$requestId) {
            return;
        }

        $serviceRequest = ServiceRequest::find($requestId);

        if (!$serviceRequest) {
            return;
        }

        if ($serviceRequest->status === ServiceRequest::STATUS_COMPLETED) {
            return;
        }

        $serviceRequest->update([
            'status' => ServiceRequest::STATUS_PENDING,
            'payment_error' => $paymentIntent->last_payment_error->message ?? 'Erreur de paiement',
        ]);
    }

    private function markAsPaid(ServiceRequest $serviceRequest, $session): void
    {
        if ($serviceRequest->status === ServiceRequest::STATUS_COMPLETED) {
            return;
        }

        $serviceRequest->update([
            'status' => ServiceRequest::STATUS_COMPLETED,
            'payment_id' => $session->payment_intent,
            'payment_amount' => $session->amount_total / 100,
            'payment_date' => now(),
            'payment_confirmed' => true,
        ]);
    }
}
