<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\ActivityReminderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ChatbotController;
use App\Http\Controllers\Admin\ChatbotLeadController;
use App\Http\Controllers\Admin\ConfigController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\FormationController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SearchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Frontend\AppController;
use App\Http\Controllers\Frontend\FormationPaymentController;
use App\Http\Controllers\Frontend\PaymentController;
use App\Http\Controllers\Frontend\WebController;
use App\Http\Controllers\Frontend\DashboardController as FrontendDashboardController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

Route::get('/', [AppController::class, 'index'])->name('home');

// Sitemaps
Route::get('/sitemap.xml', [SitemapController::class, 'main'])->name('sitemap');
Route::get('/sitemap-index.xml', [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-static.xml', [SitemapController::class, 'staticPages'])->name('sitemap.static');
Route::get('/sitemap-events.xml', [SitemapController::class, 'events'])->name('sitemap.events');
Route::get('/sitemap-formations.xml', [SitemapController::class, 'formations'])->name('sitemap.formations');
Route::get('/sitemap-posts.xml', [SitemapController::class, 'posts'])->name('sitemap.posts');
Route::get('/sitemap-services.xml', [SitemapController::class, 'services'])->name('sitemap.services');

// Static / public pages
Route::get('/contact', [AppController::class, 'contact'])->name('contact');
Route::post('/contact', [AppController::class, 'send_contact'])->name('contact.store');

Route::get('/faq', [AppController::class, 'faq'])->name('faq');
Route::get('/about-me', [AppController::class, 'about'])->name('about');

Route::get('/services', [AppController::class, 'services'])->name('services');
Route::get('/services/{slug}', [AppController::class, 'service_detail'])->name('services.details');

Route::get('/services-requests/{slug}', [AppController::class, 'service_request'])->name('services.requests');
Route::post('/services-requests/store/{id}', [AppController::class, 'service_request_store'])->name('service-requests.store');

// Formations
Route::get('/formations', [WebController::class, 'formations'])->name('formations');
Route::get('/formations/{slug}', [WebController::class, 'formation_detail'])->name('formations.details');
Route::post('/formations/{slug}/inscription', [WebController::class, 'register_formation'])->name('formations.register');
Route::get('/formations/{slug}/confirmation/{participant_id}', [WebController::class, 'showConfirmation_formation'])->name('formations.registration.confirmation');
Route::delete('/formations/{slug}/inscription/{participant_id}', [WebController::class, 'cancelRegistration_formation'])->name('formations.registration.cancel');

// Paiement formations
Route::get('/formations/{slug}/paiement/{participant_id}', [FormationPaymentController::class, 'showPaymentForm'])->name('formations.payment');
Route::post('/formations/{slug}/paiement/{participant_id}/process', [FormationPaymentController::class, 'processPayment'])->name('formations.payment.process');
Route::get('/formations/paiement/succes', [FormationPaymentController::class, 'handleSuccess'])->name('formations.payment.success');
Route::get('/formations/paiement/annulation', [FormationPaymentController::class, 'handleCancellation'])->name('formations.payment.cancel');
Route::post('/stripe/webhook/formations', [FormationPaymentController::class, 'handleWebhook'])->name('formations.payment.webhook');
Route::get('/formations/{slug}/facture/{reference}', [WebController::class, 'downloadInvoice_formation'])->name('formations.facture.download');

// Blogs
Route::get('/blogs', [WebController::class, 'blogs'])->name('blogs');
Route::get('/blogs/{slug}', [WebController::class, 'blog_detail'])->name('blogs.details');

// Événements
Route::get('/evenements', [WebController::class, 'events'])->name('evenements');
Route::get('/evenements/{slug}', [WebController::class, 'evenement_detail'])->name('evenements.details');
Route::post('/evenements/{slug}/inscription', [WebController::class, 'register'])->name('events.register');
Route::get('/evenements/{slug}/confirmation/{participant_id}', [WebController::class, 'showConfirmation'])->name('events.registration.confirmation');
Route::delete('/evenements/{slug}/inscription/{participant_id}', [WebController::class, 'cancelRegistration'])->name('events.registration.cancel');

// Paiement événements
Route::get('/evenements/{slug}/paiement/{participant_id}', [PaymentController::class, 'showPaymentForm'])->name('events.payment');
Route::post('/evenements/{slug}/paiement/{participant_id}/process', [PaymentController::class, 'processPayment'])->name('events.payment.process');
Route::get('/evenements/paiement/succes', [PaymentController::class, 'handleSuccess'])->name('events.payment.success');
Route::get('/evenements/paiement/annulation', [PaymentController::class, 'handleCancellation'])->name('events.payment.cancel');
Route::post('/stripe/webhook', [PaymentController::class, 'handleWebhook'])->name('events.payment.webhook');
Route::get('/evenements/{slug}/facture/{reference}', [WebController::class, 'downloadInvoice'])->name('evenements.facture.download');

// Legal
Route::get('/termes-et-conditions', [AppController::class, 'terms'])->name('terms.show');
Route::get('/politique-de-confidentialite', [AppController::class, 'policy'])->name('policy.show');
Route::get('/politique-des-cookies', [AppController::class, 'cookies'])->name('cookies.show');

// Newsletter
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletters.subscribe');
Route::get('/newsletter/unsubscribe/{email}', [NewsletterController::class, 'unsubscribe'])
    ->middleware('signed')
    ->name('newsletters.unsubscribe');

// Public settings
Route::get('/settings/public', [SettingController::class, 'publicFetch'])->name('settings.public');

/*
|--------------------------------------------------------------------------
| Guest routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'show_auth'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.submit');

    Route::get('/inscription', [AuthController::class, 'show_auth'])->name('register.page');
    Route::post('/register', [AuthController::class, 'register'])->name('register');

    Route::get('/password/request', [AuthController::class, 'password_request'])->name('password.request');
});

/*
|--------------------------------------------------------------------------
| Authenticated user routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/account/inactive', [AccountController::class, 'inactive'])->name('account.inactive');

    // Shared profile routes
    Route::post('/profile/update', [AccountController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profile/password', [AccountController::class, 'updatePassword'])->name('profile.password.update');

    // Client dashboard
    Route::get('/dashboard-client/profile', [FrontendDashboardController::class, 'index'])->name('dashboard.client.profile');
    Route::get('/dashboard-client/formations', [FrontendDashboardController::class, 'formation'])->name('dashboard.client.formations');
    Route::get('/dashboard-client/events', [FrontendDashboardController::class, 'event'])->name('dashboard.client.events');
    Route::get('/dashboard-client/account', [FrontendDashboardController::class, 'account'])->name('dashboard.client.account');
});

/*
|--------------------------------------------------------------------------
| Admin utility routes
|--------------------------------------------------------------------------
*/

Route::middleware(['admin.access', 'active', 'throttle:6,1'])->get('/reminders/send/cron', function () {
    Artisan::call('reminders:send');

    return response()->json([
        'ok' => true,
        'message' => 'Rappels envoyés',
    ]);
})->name('reminders.send.cron');

Route::middleware(['admin.access', 'active'])->get('/settings/fetch', [SettingController::class, 'fetch'])->name('settings.fetch');

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/

Route::middleware(['admin.access', 'active'])->prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Dashboard search
    Route::get('/search/global', [SearchController::class, 'global'])->name('dashboard.search.global');

    // Newsletters
Route::get('/newsletters', [NewsletterController::class, 'index'])->name('newsletters.index');
Route::post('/newsletters/send', [NewsletterController::class, 'send'])->name('newsletters.send');
Route::post('/newsletters/import-users', [NewsletterController::class, 'importUsers'])->name('newsletters.import-users');

// ✅ ROUTE POUR S'INSCRIRE (formulaire)
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');

// ✅ ROUTE POUR CLIQUER DANS L'EMAIL
Route::get('/newsletter/confirm/{token}', [NewsletterController::class, 'confirm'])->name('newsletter.confirm');

// Page de confirmation (React / Inertia)
Route::get('/newsletters/confirmation', function (Request $request) {
    return inertia('newsletter/confirmation', [
        'status' => $request->query('status'),
    ]);
})->name('newsletter.confirmation');

    // Services
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
    Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
    Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
    Route::get('/services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit');
    Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
    Route::put('/services/{service}/update-status', [ServiceController::class, 'toggleStatus'])->name('services.update-status');

    // Service Requests
    Route::get('/service-requests', [ServiceRequestController::class, 'index'])->name('service-requests.index');
    Route::get('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'show'])->name('service-requests.show');
    Route::put('/service-requests/{serviceRequest}/update-status', [ServiceRequestController::class, 'updateStatus'])->name('service-requests.update-status');
    Route::delete('/service-requests/{serviceRequest}', [ServiceRequestController::class, 'destroy'])->name('service-requests.destroy');

    // Posts
    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/posts/store', [PostController::class, 'store'])->name('posts.store');
    Route::get('/posts/{post}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::post('/posts/{post}/update', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}/delete', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::get('/posts/trash', [PostController::class, 'trash'])->name('posts.trash');

    // Categories
    Route::resource('/categories', CategoryController::class);

    // Account area
    Route::get('/profile', [AccountController::class, 'account'])->name('profile.account');
    Route::get('/profile/security', [AccountController::class, 'security'])->name('profile.security');
    Route::get('/profile/activities', [AccountController::class, 'activities'])->name('profile.activities');
    Route::get('/profile/notifications', [AccountController::class, 'notifications'])->name('profile.notifications');
    Route::get('/profile/notifications/feed', [AccountController::class, 'notificationsFeed'])->name('profile.notifications.feed');
    Route::post('/profile/notifications/read-all', [AccountController::class, 'markAllNotificationsAsRead'])->name('profile.notifications.read-all');
    Route::post('/profile/notifications/{notification}/read', [AccountController::class, 'markNotificationAsRead'])->name('profile.notifications.read');
    Route::post('/profile/sessions/{session}/terminate', [AccountController::class, 'terminateSession'])->name('profile.terminate-session');
    Route::post('/profile/sessions/terminate-others', [AccountController::class, 'terminateOtherSessions'])->name('profile.terminate-other-sessions');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings');
    Route::get('/settings/smtp', [SettingController::class, 'smtp'])->name('settings.smtp');
    Route::get('/settings/pusher', [SettingController::class, 'pusher'])->name('settings.pusher');
    Route::get('/settings/security', [SettingController::class, 'security'])->name('settings.security');
    Route::get('/settings/api', [SettingController::class, 'api'])->name('settings.api');
    Route::get('/settings/payment', [SettingController::class, 'payment'])->name('settings.payment');
    Route::get('/settings/socials', [SettingController::class, 'socials'])->name('settings.socials');
    Route::get('/settings/test-users', [SettingController::class, 'testUsers'])->name('settings.test-users');
    Route::post('/settings/update', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/smtp/test', [SettingController::class, 'test_send_email'])->name('settings.smtp.test');

    // Config
    Route::get('/config/system', [ConfigController::class, 'system'])->name('config.system');
    Route::post('/config/system/execute', [ConfigController::class, 'system_execute'])->name('system.execute');
    Route::get('/config/changelog', [ConfigController::class, 'changelog'])->name('config.changelog');
    Route::get('/config/activation', [ConfigController::class, 'activation'])->name('config.activation');
    Route::get('/config/social-login', [ConfigController::class, 'social_login'])->name('config.social_login');
    Route::get('/config/database', [ConfigController::class, 'index'])->name('config.database.index');
    Route::get('/config/database/clean', [ConfigController::class, 'database_clean'])->name('config.database_clean');
    Route::post('/config/database/{table}/truncate', [ConfigController::class, 'truncate'])->name('database.truncate');
    Route::post('/config/database/{table}/optimize', [ConfigController::class, 'optimize'])->name('database.optimize');
    Route::get('/config/database/backup', [ConfigController::class, 'database_backup'])->name('database.backup');
    Route::get('/config/database/logs', [ConfigController::class, 'database_logs'])->name('database.logs');

    // Event categories
    Route::resource('/event-categories', EventCategoryController::class);

    // Events
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');
    Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
    Route::post('/events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::get('/events/trash', [EventController::class, 'trash'])->name('events.trash');

    Route::get('/events/participants/{slug}', [EventController::class, 'participants'])->name('events.participants');
    Route::get('/events/{slug}/participants/{participant}', [EventController::class, 'showParticipant'])->name('events.participants.show');
    Route::get('/events/participants/{slug}/export', [EventController::class, 'exportParticipantsCsv'])->name('events.participants.export');
    Route::get('/events/{slug}/facture/{reference}', [EventController::class, 'downloadInvoice'])->name('events.participants.invoice');

    // Users
    Route::post('/users/import', [UserController::class, 'import'])->name('users.import');
    Route::get('/users/export-csv', [UserController::class, 'export'])->name('users.export');
    Route::get('/users/blocked/list', [UserController::class, 'blockedUsers'])->name('users.blocked');
    Route::post('/users/{user}/verification/resend', [UserController::class, 'resendVerification'])->name('users.verification.resend');
    Route::patch('/users/{user}/status', [AccountController::class, 'updateStatus'])->name('users.status.update');
    Route::patch('/users/{user}/role', [AccountController::class, 'updateRole'])->name('users.role.update');
    Route::patch('/users/{user}/reactivate', [UserController::class, 'reactivateUser'])->name('users.reactivate');
    Route::resource('/users', UserController::class);

    // CMS pages
    Route::get('/a-propos', [AboutController::class, 'edit'])->name('about.edit');
    Route::put('/a-propos', [AboutController::class, 'update'])->name('about.update');

    Route::get('/accueil', [HomeController::class, 'edit'])->name('home.edit');
    Route::put('/accueil', [HomeController::class, 'update'])->name('home.update');

    Route::get('/contact-page', [ContactController::class, 'edit'])->name('contact-page.edit');
    Route::put('/contact-page', [ContactController::class, 'update'])->name('contact-page.update');

    Route::get('/chatbot', [ChatbotController::class, 'edit'])->name('chatbot.edit');
    Route::put('/chatbot', [ChatbotController::class, 'update'])->name('chatbot.update');

    Route::get('/chatbot/leads', [ChatbotLeadController::class, 'index'])->name('chatbot-leads.index');
    Route::get('/chatbot/leads/export', [ChatbotLeadController::class, 'export'])->name('chatbot-leads.export');

    // Pages
    Route::get('/pages', [PageController::class, 'index'])->name('pages.index');
    Route::get('/pages/create', [PageController::class, 'create'])->name('pages.create');
    Route::post('/pages', [PageController::class, 'store'])->name('pages.store');
    Route::get('/pages/{page}', [PageController::class, 'show'])->name('pages.show');
    Route::get('/pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
    Route::put('/pages/{page}', [PageController::class, 'update'])->name('pages.update');
    Route::delete('/pages/{page}', [PageController::class, 'destroy'])->name('pages.destroy');
    Route::get('/pages/trash', [PageController::class, 'trash'])->name('pages.trash');

    // Formations admin
    Route::get('/formations', [FormationController::class, 'index'])->name('formations.index');
    Route::get('/formations/create', [FormationController::class, 'create'])->name('formations.create');
    Route::post('/formations', [FormationController::class, 'store'])->name('formations.store');
    Route::get('/formations/{formation}', [FormationController::class, 'show'])->name('formations.show');
    Route::get('/formations/{formation}/edit', [FormationController::class, 'edit'])->name('formations.edit');
    Route::post('/formations/{formation}', [FormationController::class, 'update'])->name('formations.update');
    Route::delete('/formations/{formation}', [FormationController::class, 'destroy'])->name('formations.destroy');
    Route::get('/formations/trash', [FormationController::class, 'trash'])->name('formations.trash');

    Route::get('/formations/participants/{slug}', [FormationController::class, 'participants'])->name('formations.participants');
    Route::get('/formations/{slug}/participants/{participant}', [FormationController::class, 'showParticipant'])->name('formations.participants.show');
    Route::get('/formations/participants/{slug}/export', [FormationController::class, 'exportParticipantsCsv'])->name('formations.participants.export');
    Route::get('/formations/{slug}/facture/{reference}', [FormationController::class, 'downloadInvoice'])->name('formations.participants.invoice');
});