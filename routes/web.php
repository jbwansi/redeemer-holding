<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ConfigController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\FormationController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Frontend\AppController;
use App\Http\Controllers\Frontend\FormationPaymentController;
use App\Http\Controllers\Frontend\PaymentController;
use App\Http\Controllers\Frontend\WebController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AppController::class, 'index'])->name('home');
Route::get('/contact', [AppController::class, 'contact'])->name('contact');
Route::post('/contact', [AppController::class, 'send_contact'])->name('contact');
Route::get('/about-me', [AppController::class, 'about'])->name('about');
Route::get('/services', [AppController::class, 'services'])->name('services');
Route::get('/services/{slug}', [AppController::class, 'service_detail'])->name('services.details');
Route::get('/services-requests/{slug}', [AppController::class, 'service_request'])->name('services.requests');
Route::post('/services-requests/store/{id}', [AppController::class, 'service_request_store'])->name('service-requests.store');

Route::get('formations', [WebController::class, 'formations'])->name('formations');
Route::get('formations/{slug}', [WebController::class, 'formation_detail'])->name('formations.details');

Route::get('blogs', [WebController::class, 'blogs'])->name('blogs');
Route::get('blogs/{slug}', [WebController::class, 'blog_detail'])->name('blogs.details');

Route::get('evenements', [WebController::class, 'events'])->name('evenements');
Route::get('evenements/{slug}', [WebController::class, 'evenement_detail'])->name('evenements.details');
Route::post('/evenements/{slug}/inscription', [WebController::class, 'register'])->name('events.register');
Route::get('/evenements/{slug}/confirmation/{participant_id}', [WebController::class, 'showConfirmation'])->name('events.registration.confirmation');

// Routes pour le paiement (Stripe)
Route::get('/evenements/{slug}/paiement/{participant_id}', [PaymentController::class, 'showPaymentForm'])->name('events.payment');
Route::post('/evenements/{slug}/paiement/{participant_id}/process', [PaymentController::class, 'processPayment'])->name('events.payment.process');
Route::get('/evenements/paiement/succes', [PaymentController::class, 'handleSuccess'])->name('events.payment.success');
Route::get('/evenements/paiement/annulation', [PaymentController::class, 'handleCancellation'])->name('events.payment.cancel');
Route::get('/evenements/{slug}/facture/{reference}', [WebController::class, 'downloadInvoice'])->name('evenements.facture.download');
// Route pour le webhook Stripe
Route::post('/stripe/webhook', [PaymentController::class, 'handleWebhook']);

// Route pour annuler une inscription
Route::delete('/evenements/{slug}/inscription/{participant_id}', [EventController::class, 'cancelRegistration'])->name('events.registration.cancel');

// Routes pour le paiement des formations (Stripe)
Route::get('/formations/{slug}/paiement/{participant_id}', [FormationPaymentController::class, 'showPaymentForm'])->name('formations.payment');
Route::post('/formations/{slug}/paiement/{participant_id}/process', [FormationPaymentController::class, 'processPayment'])->name('formations.payment.process');
Route::get('/formations/paiement/succes', [FormationPaymentController::class, 'handleSuccess'])->name('formations.payment.success');
Route::get('/formations/paiement/annulation', [FormationPaymentController::class, 'handleCancellation'])->name('formations.payment.cancel');
Route::get('/formations/{slug}/facture/{reference}', [WebController::class, 'downloadInvoice_formation'])->name('formations.facture.download');
//formation 
Route::post('/formations/{slug}/inscription', [WebController::class, 'register_formation'])->name('formations.register');
Route::get('/formations/{slug}/confirmation/{participant_id}', [WebController::class, 'showConfirmation_formation'])->name('formations.registration.confirmation');

// Route pour le webhook Stripe des formations
Route::post('/stripe/webhook/formations', [FormationPaymentController::class, 'handleWebhook']);

// Route pour annuler une inscription à une formation
Route::delete('/formations/{slug}/inscription/{participant_id}', [FormationController::class, 'cancelRegistration'])->name('formations.registration.cancel');

Route::get('termes-et-conditions', [AppController::class, 'terms'])->name('terms.show');
Route::get('politique-de-confidentialite', [AppController::class, 'policy'])->name('policy.show');
Route::get('politique-des-cookies', [AppController::class, 'cookies'])->name('cookies.show');

Route::middleware(['guest'])->group(function () {
    Route::get('login', [AuthController::class, 'show_auth'])->name("login");
    Route::post('login', [AuthController::class, 'login'])->name("login");
    Route::post('register', [AuthController::class, 'register'])->name("register");
    Route::get('password/request', [AuthController::class, 'password_request'])->name('password.request');
});



Route::get('settings/fetch', [SettingController::class, 'fetch'])->name('settings.fetch');


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
                Route::get('/events/participants/{slug}', [EventController::class, 'participants'])
                    ->name('events.participants');
                Route::get('/events/{slug}/participants/{participant}', [EventController::class, 'showParticipant'])
                    ->name('events.participants.show');
                Route::get('/events/{slug}/facture/{reference}', [EventController::class, 'downloadInvoice'])
                    ->name('events.participants.invoice');
            });

            Route::controller(UserController::class)->group(function () {
                Route::resource('users', UserController::class);
                Route::post('users/{user}/verification/resend', 'resendVerification')->name('users.verification.resend');
                Route::patch('users/{user}/status', [AccountController::class, 'updateStatus'])->name('users.status.update');
                Route::patch('users/{user}/role', [AccountController::class, 'updateRole'])->name('users.role.update');
                // Ajout de la nouvelle route pour les utilisateurs bloqués
                Route::get('users/blocked/list', 'blockedUsers')->name('users.blocked');
                Route::patch('users/{user}/reactivate', 'reactivateUser')->name('users.reactivate');
                Route::post('/users/export', 'export')->name('users.export');
            });

            Route::controller(PageController::class)->group(function () {
                Route::get('/pages', 'index')->name('pages.index');
                Route::get('/pages/create', 'create')->name('pages.create');
                Route::post('/pages', 'store')->name('pages.store');
                Route::get('/pages/{page}/edit', 'edit')->name('pages.edit');
                Route::put('/pages/{page}', 'update')->name('pages.update');
                Route::delete('/pages/{page}', 'destroy')->name('pages.destroy');
                Route::get('/pages/trash', 'trash')->name('pages.trash');
                Route::get('/pages/{page}', 'show')->name('pages.show');
            });
            //formations
            Route::controller(FormationController::class)->group(function () {
                Route::get('/formations', 'index')->name('formations.index');
                Route::get('/formations/create', 'create')->name('formations.create');
                Route::post('/formations', 'store')->name('formations.store');
                Route::get('/formations/{formation}/edit', 'edit')->name('formations.edit');
                Route::put('/formations/{formation}', 'update')->name('formations.update');
                Route::delete('/formations/{formation}', 'destroy')->name('formations.destroy');
                Route::get('/formations/trash', 'trash')->name('formations.trash');
                Route::get('/formations/{formation}', 'show')->name('formations.show');
                Route::get('/formations/participants/{slug}', [FormationController::class, 'participants'])
                    ->name('formations.participants');
                Route::get('/formations/{slug}/participants/{participant}', [FormationController::class, 'showParticipant'])
                    ->name('formations.participants.show');
                Route::get('/formations/{slug}/facture/{reference}', [FormationController::class, 'downloadInvoice'])
                    ->name('formations.participants.invoice');
            });
        });
    });
});
Route::middleware('auth')->group(function () {
    Route::middleware(['active'])->group(function () {
        Route::controller(App\Http\Controllers\Frontend\DashboardController::class)->group(function () {

            Route::get("/logout", [AuthController::class, "logout"])->name("logout");


            Route::get('dashboard-client/profile', 'index')->name('dashboard.client.profile');
            Route::get('dashboard-client/formations', 'formation')->name('dashboard.client.formations');
            Route::get('dashboard-client/events', 'event')->name('dashboard.client.events');
            Route::get('dashboard-client/account', 'account')->name('dashboard.client.account');
        });
        Route::post('/profile/password', [AccountController::class, 'updatePassword'])->name('profile.password.update');
        Route::post('/profile/update', [AccountController::class, 'updateProfile'])->name('profile.update');
    });
});
