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


    public function showTrainingPayment($slug, $participant_id)
    {
        return $this->paymentManager
            ->handler('training')
            ->show($slug, $participant_id);
    }

    public function processTrainingPayment($slug, $participant_id)
    {
        return $this->paymentManager
            ->handler('training')
            ->process($slug, $participant_id);
    }

    public function trainingSuccess(Request $request)
    {
        return $this->paymentManager
            ->handler('training')
            ->success($request);
    }

    public function trainingCancel(Request $request)
    {
        return $this->paymentManager
            ->handler('training')
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