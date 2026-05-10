<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Frontend\AppController;
use App\Http\Controllers\Frontend\BlogController;
use App\Http\Controllers\Frontend\EventController;
use App\Http\Controllers\Frontend\ServiceController;
use App\Http\Controllers\Frontend\FormationController;
use App\Http\Controllers\Frontend\NewsletterController;
use App\Http\Controllers\SitemapController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [AppController::class, 'index'])->name('home');


// =========================
// Static pages
// =========================

Route::controller(AppController::class)->group(function () {

    Route::get('/contact', 'contact')->name('contact');

    Route::post('/contact', 'send_contact')
        ->middleware('throttle:5,1')
        ->name('contact.store');

    Route::get('/faq', 'faq')->name('faq');

    Route::get('/about-me', 'about')->name('about');

    Route::get('/termes-et-conditions', 'terms')->name('terms.show');

    Route::get('/politique-de-confidentialite', 'policy')->name('policy.show');

    Route::get('/politique-des-cookies', 'cookies')->name('cookies.show');
});


// =========================
// Services
// =========================

Route::prefix('services')
    ->name('services.')
    ->controller(ServiceController::class)
    ->group(function () {

        Route::get('/', 'services')->name('index');

        Route::get('/{slug}', 'service_detail')->name('show');
    });


// =========================
// Blogs
// =========================

Route::prefix('blogs')
    ->name('blogs.')
    ->controller(BlogController::class)
    ->group(function () {

        Route::get('/', 'blogs')->name('index');

        Route::get('/{slug}', 'blog_detail')->name('show');
    });


// =========================
// Events
// =========================

Route::prefix('evenements')
    ->name('events.')
    ->controller(EventController::class)
    ->group(function () {

        Route::get('/', 'events')->name('index');

        Route::get('/{slug}', 'evenement_detail')->name('show');

        Route::post('/{slug}/inscription', 'register')
            ->middleware('throttle:3,1')
            ->name('register');

        Route::get('/{slug}/confirmation/{participant_id}', 'showConfirmation')
            ->name('confirmation');

        Route::delete('/{slug}/inscription/{participant_id}', 'cancelRegistration')
            ->name('cancel');
    });


// =========================
// Formations
// =========================

Route::prefix('formations')
    ->name('formations.')
    ->controller(FormationController::class)
    ->group(function () {

        Route::get('/', 'formations')->name('index');

        Route::get('/{slug}', 'formation_detail')->name('show');

        Route::post('/{slug}/inscription', 'register_formation')
            ->middleware('throttle:3,1')
            ->name('register');

        Route::get('/{slug}/confirmation/{participant_id}', 'showConfirmation_formation')
            ->name('confirmation');

        Route::delete('/{slug}/inscription/{participant_id}', 'cancelRegistration_formation')
            ->name('cancel');
    });


// =========================
// Newsletter
// =========================

Route::prefix('newsletter')
    ->name('newsletter.')
    ->controller(NewsletterController::class)
    ->group(function () {

        Route::post('/subscribe', 'subscribe')
            ->middleware('throttle:5,1')
            ->name('subscribe');

        Route::get('/confirm/{token}', 'confirm')
            ->name('confirm');

        Route::get('/confirmation', function () {
            return inertia('newsletter/confirmation');
        })->name('confirmation');
    });


// =========================
// Sitemap
// =========================

Route::prefix('sitemap')
    ->controller(SitemapController::class)
    ->group(function () {

        Route::get('/index.xml', 'index')->name('sitemap.index');

        Route::get('/static.xml', 'staticPages')->name('sitemap.static');

        Route::get('/events.xml', 'events')->name('sitemap.events');

        Route::get('/formations.xml', 'formations')->name('sitemap.formations');

        Route::get('/posts.xml', 'posts')->name('sitemap.posts');
    });