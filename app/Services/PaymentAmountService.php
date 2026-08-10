<?php

namespace App\Services;

class PaymentAmountService
{
    private const SERVICE_FEE_RATE = 0.05;

    /**
     * @return array{subtotal: int|float|string, serviceFee: float, total: float}
     */
    public function calculate(int|float|string $subtotal): array
    {
        $serviceFee = (float) $subtotal * self::SERVICE_FEE_RATE;

        return [
            'subtotal' => $subtotal,
            'serviceFee' => $serviceFee,
            'total' => (float) $subtotal + $serviceFee,
        ];
    }
}
