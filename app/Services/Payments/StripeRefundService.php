<?php

namespace App\Services\Payments;

use Stripe\Refund;

class StripeRefundService
{
    public function createFullRefund(
        string $paymentIntentId,
        array $metadata,
        string $idempotencyKey
    ) {
        return Refund::create([
            'payment_intent' => $paymentIntentId,
            'metadata' => $metadata,
        ], [
            'idempotency_key' => $idempotencyKey,
        ]);
    }
}
