<?php

namespace App\Services\Payments;

use App\Services\Payments\Handlers\EventPaymentHandler;
use App\Services\Payments\Handlers\ServicePaymentHandler;
use App\Services\Payments\Handlers\TrainingPaymentHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class PaymentManager
{
    public function handler(string $type)
    {
        return match ($type) {
            'event' => app(EventPaymentHandler::class),
            'training' => app(TrainingPaymentHandler::class),
            'formation' => app(TrainingPaymentHandler::class),
            'service' => app(ServicePaymentHandler::class),
            default => abort(404, 'Type de paiement invalide.'),
        };
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $stripeEvent = Webhook::constructEvent(
                $payload,
                $signature,
                $secret
            );

            switch ($stripeEvent->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($stripeEvent->data->object);
                    break;

                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($stripeEvent->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($stripeEvent->data->object);
                    break;
            }

            return response()->json([
                'status' => 'success',
            ]);
        } catch (UnexpectedValueException $e) {
            Log::error('Payload Stripe invalide.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Payload invalide.',
            ], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Signature Stripe invalide.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Signature invalide.',
            ], 400);
        } catch (\Throwable $e) {
            Log::error('Erreur webhook Stripe.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Erreur serveur.',
            ], 500);
        }
    }

    private function handleCheckoutSessionCompleted($session): void
    {
        $type = $session->metadata->payment_type ?? null;

        if (!$type) {
            Log::warning('Webhook Stripe sans payment_type.', [
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        $this->handler($type)->handleCheckoutSessionCompleted($session);
    }

    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $type = $paymentIntent->metadata->payment_type ?? null;

        if (!$type) {
            Log::warning('PaymentIntent Stripe sans payment_type.', [
                'payment_intent_id' => $paymentIntent->id ?? null,
            ]);

            return;
        }

        if (method_exists($this->handler($type), 'handlePaymentIntentSucceeded')) {
            $this->handler($type)->handlePaymentIntentSucceeded($paymentIntent);
        }
    }

    private function handlePaymentFailed($paymentIntent): void
    {
        $type = $paymentIntent->metadata->payment_type ?? null;

        if (!$type) {
            Log::warning('PaymentIntent échoué sans payment_type.', [
                'payment_intent_id' => $paymentIntent->id ?? null,
            ]);

            return;
        }

        if (method_exists($this->handler($type), 'handlePaymentFailed')) {
            $this->handler($type)->handlePaymentFailed($paymentIntent);
        }
    }
}