<?php

namespace App\Services\Payments\Contracts;

use Illuminate\Http\Request;

interface PaymentHandlerInterface
{
    public function show(string $slug, int $participantId);

    public function process(string $slug, int $participantId);

    public function success(Request $request);

    public function cancel(Request $request);

    public function handleCheckoutSessionCompleted($session): void;
}