<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\AppController;
use App\Http\Controllers\Frontend\BlogController;
use App\Http\Controllers\Frontend\EventController;
use App\Http\Controllers\Frontend\TrainingController;
use App\Http\Controllers\Frontend\NewsletterController as FrontendNewsletterController;
use App\Http\Controllers\Frontend\ServiceController as FrontendServiceController;
use App\Http\Controllers\Frontend\SettingController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [AppController::class, 'index'])->name('home');

// Static pages
Route::get('/contact', [AppController::class, 'contact'])->name('contact');
Route::post('/contact', [AppController::class, 'send_contact'])->middleware('throttle:5,1')->name('contact.store');
Route::get('/faq', [AppController::class, 'faq'])->name('faq');
Route::get('/about-me', [AppController::class, 'about'])->name('about');
Route::get('/termes-et-conditions', [AppController::class, 'terms'])->name('terms.show');
Route::get('/politique-de-confidentialite', [AppController::class, 'policy'])->name('policy.show');
Route::get('/politique-des-cookies', [AppController::class, 'cookies'])->name('cookies.show');

// Services
Route::get('/services', [FrontendServiceController::class, 'services'])->name('services');
Route::get('/services/{slug}', [FrontendServiceController::class, 'service_detail'])->name('services.details');
Route::get('/services-requests/{slug}', [FrontendServiceController::class, 'service_request'])->name('services.requests');
Route::post('/services-requests/store/{id}', [FrontendServiceController::class, 'service_request_store'])->middleware('throttle:3,1')->name('service-requests.store');

// Formations
Route::get('/formations', [TrainingController::class, 'trainings'])->name('formations');
Route::get('/formations/{slug}', [TrainingController::class, 'formation_detail'])->name('formations.details');
Route::post('/formations/{slug}/inscription', [TrainingController::class, 'register_formation'])->middleware('throttle:3,1')->name('trainings.register');
Route::get('/formations/{slug}/confirmation/{participant_id}', [TrainingController::class, 'showConfirmation_formation'])->name('trainings.registration.confirmation');
Route::delete('/formations/{slug}/inscription/{participant_id}', [TrainingController::class, 'cancelRegistration_formation'])->name('trainings.registration.cancel');
Route::get('/formations/{slug}/facture/{reference}', [TrainingController::class, 'downloadInvoice_formation'])->name('formations.facture.download');

// Blogs
Route::get('/blogs', [BlogController::class, 'blogs'])->name('blogs');
Route::get('/blogs/{slug}', [BlogController::class, 'blog_detail'])->name('blogs.details');

// Evenements
Route::get('/evenements', [EventController::class, 'events'])->name('evenements');
Route::get('/evenements/{slug}', [EventController::class, 'evenement_detail'])->name('evenements.details');
Route::post('/evenements/{slug}/inscription', [EventController::class, 'register'])->middleware('throttle:3,1')->name('events.register');
Route::get('/evenements/{slug}/confirmation/{participant_id}', [EventController::class, 'showConfirmation'])->name('events.registration.confirmation');
Route::delete('/evenements/{slug}/inscription/{participant_id}', [EventController::class, 'cancelRegistration'])->name('events.registration.cancel');
Route::get('/evenements/{slug}/facture/{reference}', [EventController::class, 'downloadInvoice'])->name('evenements.facture.download');

// Newsletter
Route::post('/newsletter/subscribe', [FrontendNewsletterController::class, 'subscribe'])->middleware('throttle:5,1')->name('newsletter.subscribe');
Route::get('/newsletter/confirm/{token}', [FrontendNewsletterController::class, 'confirm'])->name('newsletter.confirm');
Route::get('/newsletter/unsubscribe/{email}', [FrontendNewsletterController::class, 'unsubscribe'])->middleware('signed')->name('newsletters.unsubscribe');
Route::get('/newsletter/confirmation', function (Request $request) {
    return inertia('newsletter/confirmation', ['status' => $request->query('status')]);
})->name('newsletter.confirmation');

// Public settings
Route::get('/settings/public', [SettingController::class, 'publicFetch'])->name('settings.public');
