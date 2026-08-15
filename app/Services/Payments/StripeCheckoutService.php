<?php

namespace App\Services\Payments;

use Stripe\Checkout\Session as StripeSession;

class StripeCheckoutService
{
    public function retrieveSession(string $sessionId)
    {
        return StripeSession::retrieve($sessionId);
    }

    public function createSession(array $data)
    {
        return StripeSession::create([
            'payment_method_types' => ['card'],

            'line_items' => $data['line_items'],

            'customer_email' => $data['customer_email'],

            'client_reference_id' => $data['client_reference_id'],

            'metadata' => $data['metadata'],

            'payment_intent_data' => [
                'metadata' => $data['metadata'],
            ],

            'mode' => 'payment',

            'success_url' => $data['success_url'],

            'cancel_url' => $data['cancel_url'],
        ]);
    }

    public function buildProductLineItem(
        string $name,
        float $amount,
        int $quantity = 1,
        ?string $description = null,
        array $images = []
    ): array {
        return [
            'price_data' => [
                'currency' => 'chf',
                'product_data' => [
                    'name' => $name,
                    'description' => $description,
                    'images' => $images,
                ],
                'unit_amount' => round($amount * 100),
            ],
            'quantity' => $quantity,
        ];
    }

    public function buildServiceFeeLineItem(float $amount): array
    {
        return [
            'price_data' => [
                'currency' => 'chf',
                'product_data' => [
                    'name' => 'Frais de service',
                    'description' => '5% du total',
                ],
                'unit_amount' => round($amount * 100),
            ],
            'quantity' => 1,
        ];
    }
}
