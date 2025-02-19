<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ConfigController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Frontend\AppController;
use App\Http\Controllers\Frontend\WebController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AppController::class, 'index'])->name('home');
Route::get('/contact', [AppController::class, 'contact'])->name('contact');
Route::get('/about-me', [AppController::class, 'about'])->name('about');
Route::get('/services', [AppController::class, 'services'])->name('services');
Route::get('/services/{slug}', [AppController::class, 'service_detail'])->name('services.details');
Route::get('/services-requests/{slug}', [AppController::class, 'service_request'])->name('services.requests');
Route::post('/services-requests/store/{id}', [AppController::class, 'service_request_store'])->name('service-requests.store');

Route::get('formations', [WebController::class, 'formations'])->name('formations');
Route::get('formations/{slug}', [WebController::class, 'formation_detail'])->name('formations.details');

Route::get('blogs', [WebController::class, 'blogs'])->name('blogs');
Route::get('blogs/{slug}', [WebController::class, 'blog_detail'])->name('blogs.details');

Route::get('terms', [AppController::class, 'terms'])->name('terms.show');
Route::get('policy', [AppController::class, 'policy'])->name('policy.show');

Route::middleware(['guest'])->group(function () {
    Route::get('login', [AuthController::class, 'show_auth'])->name("login");
    Route::post('login', [AuthController::class, 'login'])->name("login");
    Route::get('password/request', [AuthController::class, 'password_request'])->name('password.request');
});


Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::middleware(['active'])->group(function () {
        Route::get("/logout", [AuthController::class, "logout"])->name("logout");
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [DashboardController::class, 'index'])->name("dashboard");

            Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
            Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
            Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
            Route::get('/services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit');
            Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
            Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
            Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
            Route::put('/services/{service}/update-status', [ServiceController::class, 'toggleStatus'])->name('services.update-status');
            // Service Request
            Route::get('/service-requests', [ServiceRequestController::class, 'index'])->name('service-requests.index');
            Route::get('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'show'])->name('service-requests.show');
            Route::put('/service-requests/{serviceRequest}/update-status', [ServiceRequestController::class, 'updateStatus'])->name('service-requests.update-status');
            Route::delete('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'destroy'])->name('service-requests.destroy');
        });

        Route::controller(PostController::class)->group(function () {
            Route::get('posts', 'index')->name('posts.index');
            Route::get('posts/create', 'create')->name('posts.create');
            Route::post('posts/store', 'store')->name('posts.store');
            Route::get('posts/{post}/edit', 'edit')->name('posts.edit');
            Route::post('posts/{post}/update', 'update')->name('posts.update');
            Route::delete('posts/{post}/delete', 'destroy')->name('posts.destroy');
            Route::get('posts/trash', 'trash')->name('posts.trash');
        });

        Route::resource('categories', CategoryController::class);

        Route::controller(AccountController::class)->group(function () {
            Route::get('/profile', 'account')->name('profile.account');
            Route::post('/profile/update', 'updateProfile')->name('profile.update');
            Route::post('/profile/sessions/{session}/terminate', 'terminateSession')->name('profile.terminate-session');
            Route::post('/profile/sessions/terminate-others', 'terminateOtherSessions')->name('profile.terminate-other-sessions');
            Route::get('/profile/security', 'security')->name('profile.security');
            Route::get('/profile/activities', 'activities')->name('profile.activities');
            Route::post('/profile/password', 'updatePassword')->name('profile.password.update');
        });

        Route::controller(SettingController::class)->group(function () {
            Route::get('settings', 'index')->name('settings');
            Route::get('settings/smtp', 'smtp')->name('settings.smtp');
            Route::get('settings/pusher', 'pusher')->name('settings.pusher');
            Route::get('settings/security', 'security')->name('settings.security');
            Route::get('settings/api', 'api')->name('settings.api');
            Route::get('settings/payment', 'payment')->name('settings.payment');
            Route::get('settings/socials', 'socials')->name('settings.socials');
            Route::post('settings/update', 'update')->name('settings.update');
            Route::get('settings/fetch', 'fetch')->name('settings.fetch');
            Route::post('settings/smtp/test', 'test_send_email')->name('settings.smtp.test');
        });

        Route::controller(ConfigController::class)->group(function () {
            Route::get('config/system', 'system')->name('config.system');
            Route::post('config/system/execute', 'system_execute')->name('system.execute');
            Route::get('config/changelog', 'changelog')->name('config.changelog');
            Route::get('config/activation', 'activation')->name('config.activation');
            Route::get('config/social-login', 'social_login')->name('config.social_login');
            Route::get('config/database/clean', 'database_clean')->name('config.database_clean');
            Route::post('config/database/{table}/truncate', 'truncate')->name('database.truncate');
            Route::post('config/database/{table}/optimize', 'optimize')->name('database.optimize');
        });

        Route::resource('event-categories', EventCategoryController::class);
        Route::controller(EventController::class)->group(function () {
            Route::get('events', 'index')->name('events.index');
            Route::get('events/create', 'create')->name('events.create');
            Route::post('events', 'store')->name('events.store');
            Route::get('events/{event}/edit', 'edit')->name('events.edit');
            Route::post('events/{event}', 'update')->name('events.update');
            Route::delete('events/{event}', 'destroy')->name('events.destroy');
            Route::get('events/trash', 'trash')->name('events.trash');
            Route::get('events/{event}', 'show')->name('events.show');
        });

    });
});
