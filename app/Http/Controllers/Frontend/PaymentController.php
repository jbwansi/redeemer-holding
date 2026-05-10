<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\Payments\PaymentManager;
use Illuminate\Http\Request;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentManager $paymentManager
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function showEventPayment($slug, $participant_id)
    {
        return $this->paymentManager
            ->handler('event')
            ->show($slug, $participant_id);
    }

    public function processEventPayment($slug, $participant_id)
    {
        return $this->paymentManager
            ->handler('event')
            ->process($slug, $participant_id);
    }

    public function eventSuccess(Request $request)
    {
        return $this->paymentManager
            ->handler('event')
            ->success($request);
    }

    public function eventCancel(Request $request)
    {
        return $this->paymentManager
            ->handler('event')
            ->cancel($request);
    }


    public function showFormationPayment($slug, $participant_id)
    {
        return $this->paymentManager
            ->handler('formation')
            ->show($slug, $participant_id);
    }

    public function processFormationPayment($slug, $participant_id)
    {
        return $this->paymentManager
            ->handler('formation')
            ->process($slug, $participant_id);
    }

    public function formationSuccess(Request $request)
    {
        return $this->paymentManager
            ->handler('formation')
            ->success($request);
    }

    public function formationCancel(Request $request)
    {
        return $this->paymentManager
            ->handler('formation')
            ->cancel($request);
    }


    public function showServicePayment($slug, $request_id)
    {
        return $this->paymentManager
            ->handler('service')
            ->show($slug, $request_id);
    }

    public function processServicePayment($slug, $request_id)
    {
        return $this->paymentManager
            ->handler('service')
            ->process($slug, $request_id);
    }

    public function serviceSuccess(Request $request)
    {
        return $this->paymentManager
            ->handler('service')
            ->success($request);
    }

    public function serviceCancel(Request $request)
    {
        return $this->paymentManager
            ->handler('service')
            ->cancel($request);
    }


    public function webhook(Request $request)
    {
        return $this->paymentManager->webhook($request);
    }
}