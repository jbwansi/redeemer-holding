<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\PaymentController;

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/

Route::controller(PaymentController::class)->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Events Payments
    |--------------------------------------------------------------------------
    */

    Route::get('/evenements/{slug}/paiement/{participant_id}', 'showEventPayment')
        ->name('events.payment');

    Route::post('/evenements/{slug}/paiement/{participant_id}/process', 'processEventPayment')
        ->name('events.payment.process');

    Route::get('/evenements/paiement/succes', 'eventSuccess')
        ->name('events.payment.success');

    Route::get('/evenements/paiement/annulation', 'eventCancel')
        ->name('events.payment.cancel');


    /*
    |--------------------------------------------------------------------------
    | Trainings Payments
    |--------------------------------------------------------------------------
    */

    Route::get('/formations/{slug}/paiement/{participant_id}', 'showTrainingPayment')
        ->name('trainings.payment');

    Route::post('/formations/{slug}/paiement/{participant_id}/process', 'processTrainingPayment')
        ->name('trainings.payment.process');

    Route::get('/formations/paiement/succes', 'trainingSuccess')
        ->name('trainings.payment.success');

    Route::get('/formations/paiement/annulation', 'trainingCancel')
        ->name('trainings.payment.cancel');


    /*
    |--------------------------------------------------------------------------
    | Services Payments
    |--------------------------------------------------------------------------
    */

    Route::get('/services/{slug}/paiement/{request_id}', 'showServicePayment')
        ->name('services.payment');

    Route::post('/services/{slug}/paiement/{request_id}/process', 'processServicePayment')
        ->name('services.payment.process');

    Route::get('/services/paiement/succes', 'serviceSuccess')
        ->name('services.payment.success');

    Route::get('/services/paiement/annulation', 'serviceCancel')
        ->name('services.payment.cancel');


    /*
    |--------------------------------------------------------------------------
    | Stripe Webhook
    |--------------------------------------------------------------------------
    */

    Route::post('/stripe/webhook', 'webhook')
        ->name('payments.webhook');
});