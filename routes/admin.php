<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

use App\Http\Controllers\Admin\{
    AboutController,
    AccountController,
    CategoryController,
    ChatbotController,
    ChatbotLeadController,
    ConfigController,
    ContactController,
    DashboardController,
    EventCategoryController,
    EventController,
    TrainingController,
    HomeController,
    NewsletterController,
    PageController,
    PageContentController,
    PostController,
    SearchController,
    ServiceController,
    ServiceRequestController,
    SettingController,
    TestimonialController,
    UserController
};

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    Route::get('/admin/page-contents', [PageContentController::class, 'index'])
        ->name('page-contents.index');

    Route::post('/admin/page-contents', [PageContentController::class, 'update'])
        ->name('page-contents.update');
});


Route::middleware(['admin.access', 'active'])->group(function () {

    Route::get('/settings/fetch', [SettingController::class, 'fetch'])
        ->name('settings.fetch');

    Route::get('/reminders/send/cron', function () {
        Artisan::call('reminders:send');

        return response()->json([
            'ok' => true,
            'message' => 'Rappels envoyés',
        ]);
    })
        ->middleware('throttle:6,1')
        ->name('reminders.send.cron');


    Route::prefix('dashboard')->group(function () {

        Route::get('/', [DashboardController::class, 'index'])
            ->name('dashboard');

        Route::get('/search/global', [SearchController::class, 'global'])
            ->name('dashboard.search.global');


        /*
        |--------------------------------------------------------------------------
        | Newsletters
        |--------------------------------------------------------------------------
        */

        Route::prefix('newsletters')
            ->name('newsletters.')
            ->controller(NewsletterController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/send', 'send')->name('send');
                Route::post('/import-users', 'importUsers')->name('import-users');
            });


        /*
        |--------------------------------------------------------------------------
        | Services
        |--------------------------------------------------------------------------
        */

        Route::prefix('services')
            ->name('services.')
            ->controller(ServiceController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');

                Route::post('/reorder-home', 'reorderHome')->name('reorderHome');

                Route::get('/{service}', 'show')->name('show');
                Route::get('/{service}/edit', 'edit')->name('edit');
                Route::put('/{service}', 'update')->name('update');
                Route::delete('/{service}', 'destroy')->name('destroy');

                Route::patch('/{service}/toggle-home', 'toggleHome')->name('toggleHome');
                Route::put('/{service}/update-status', 'toggleStatus')->name('update-status');
            });


        /*
        |--------------------------------------------------------------------------
        | Service Requests
        |--------------------------------------------------------------------------
        */

        Route::prefix('service-requests')
            ->name('service-requests.')
            ->controller(ServiceRequestController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/{serviceRequest}', 'show')->name('show');
                Route::put('/{serviceRequest}/update-status', 'updateStatus')->name('update-status');
                Route::delete('/{serviceRequest}', 'destroy')->name('destroy');
            });


        /*
        |--------------------------------------------------------------------------
        | Posts
        |--------------------------------------------------------------------------
        */

        Route::prefix('posts')
            ->name('posts.')
            ->controller(PostController::class)
            ->group(function () {
                Route::get('/trash', 'trash')->name('trash');

                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/store', 'store')->name('store');
                Route::get('/{post}/edit', 'edit')->name('edit');
                Route::post('/{post}/update', 'update')->name('update');
                Route::delete('/{post}/delete', 'destroy')->name('destroy');
            });


        /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */

        Route::resource('categories', CategoryController::class);


        /*
        |--------------------------------------------------------------------------
        | Account
        |--------------------------------------------------------------------------
        */

        Route::prefix('profile')
            ->name('profile.')
            ->controller(AccountController::class)
            ->group(function () {
                Route::get('/', 'account')->name('account');
                Route::get('/security', 'security')->name('security');
                Route::get('/activities', 'activities')->name('activities');
                Route::get('/notifications', 'notifications')->name('notifications');
                Route::get('/notifications/feed', 'notificationsFeed')->name('notifications.feed');

                Route::post('/notifications/read-all', 'markAllNotificationsAsRead')
                    ->name('notifications.read-all');

                Route::post('/notifications/{notification}/read', 'markNotificationAsRead')
                    ->name('notifications.read');

                Route::post('/sessions/{session}/terminate', 'terminateSession')
                    ->name('terminate-session');

                Route::post('/sessions/terminate-others', 'terminateOtherSessions')
                    ->name('terminate-other-sessions');
            });


        /*
        |--------------------------------------------------------------------------
        | Settings
        |--------------------------------------------------------------------------
        */

        Route::prefix('settings')
            ->name('settings.')
            ->controller(SettingController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/smtp', 'smtp')->name('smtp');
                Route::get('/pusher', 'pusher')->name('pusher');
                Route::get('/security', 'security')->name('security');
                Route::get('/api', 'api')->name('api');
                Route::get('/payment', 'payment')->name('payment');
                Route::get('/socials', 'socials')->name('socials');
                Route::get('/test-users', 'testUsers')->name('test-users');

                Route::post('/update', 'update')->name('update');
                Route::post('/smtp/test', 'test_send_email')->name('smtp.test');
            });


        /*
        |--------------------------------------------------------------------------
        | Config
        |--------------------------------------------------------------------------
        */

        Route::prefix('config')
            ->name('config.')
            ->controller(ConfigController::class)
            ->group(function () {
                Route::get('/system', 'system')->name('system');
                Route::post('/system/execute', 'system_execute')->name('system.execute');
                Route::get('/changelog', 'changelog')->name('changelog');
                Route::get('/activation', 'activation')->name('activation');
                Route::get('/social-login', 'social_login')->name('social_login');

                Route::get('/database', 'index')->name('database.index');
                Route::get('/database/clean', 'database_clean')->name('database_clean');
                Route::post('/database/{table}/truncate', 'truncate')->name('database.truncate');
                Route::post('/database/{table}/optimize', 'optimize')->name('database.optimize');
                Route::get('/database/backup', 'database_backup')->name('database.backup');
                Route::get('/database/logs', 'database_logs')->name('database.logs');
            });


        /*
        |--------------------------------------------------------------------------
        | Event Categories
        |--------------------------------------------------------------------------
        */

        Route::resource('event-categories', EventCategoryController::class);





        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        Route::prefix('users')
            ->name('users.')
            ->group(function () {
                Route::post('/import', [UserController::class, 'import'])->name('import');
                Route::get('/export-csv', [UserController::class, 'export'])->name('export');
                Route::get('/blocked/list', [UserController::class, 'blockedUsers'])->name('blocked');
                Route::post('/{user}/verification/resend', [UserController::class, 'resendVerification'])->name('verification.resend');
                Route::patch('/{user}/status', [AccountController::class, 'updateStatus'])->name('status.update');
                Route::patch('/{user}/role', [AccountController::class, 'updateRole'])->name('role.update');
                Route::patch('/{user}/reactivate', [UserController::class, 'reactivateUser'])->name('reactivate');
            });

        Route::resource('users', UserController::class);


        /*
        |--------------------------------------------------------------------------
        | CMS Pages
        |--------------------------------------------------------------------------
        */

        Route::controller(AboutController::class)->group(function () {
            Route::get('/a-propos', 'edit')->name('about.edit');
            Route::put('/a-propos', 'update')->name('about.update');
        });

        Route::controller(HomeController::class)->group(function () {
            Route::get('/accueil', 'edit')->name('home.edit');
            Route::put('/accueil', 'update')->name('home.update');
        });

        Route::controller(ContactController::class)->group(function () {
            Route::get('/contact-page', 'edit')->name('contact-page.edit');
            Route::put('/contact-page', 'update')->name('contact-page.update');
        });

        Route::controller(ChatbotController::class)->group(function () {
            Route::get('/chatbot', 'edit')->name('chatbot.edit');
            Route::put('/chatbot', 'update')->name('chatbot.update');
        });

        Route::prefix('chatbot/leads')
            ->name('chatbot-leads.')
            ->controller(ChatbotLeadController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/export', 'export')->name('export');
            });


        /*
        |--------------------------------------------------------------------------
        | Dynamic Pages
        |--------------------------------------------------------------------------
        */

        Route::prefix('pages')
            ->name('pages.')
            ->controller(PageController::class)
            ->group(function () {
                Route::get('/trash', 'trash')->name('trash');

                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');
                Route::get('/{page}', 'show')->name('show');
                Route::get('/{page}/edit', 'edit')->name('edit');
                Route::put('/{page}', 'update')->name('update');
                Route::delete('/{page}', 'destroy')->name('destroy');
            });




        /*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/

        Route::prefix('events')
            ->name('events.')
            ->controller(EventController::class)
            ->group(function () {
                Route::get('/trash', 'trash')->name('trash');

                Route::get('/participants/{slug}', 'participants')->name('participants');
                Route::get('/participants/{slug}/export', 'exportParticipantsCsv')->name('participants.export');
                Route::get('/{slug}/participants/{participant}', 'showParticipant')->name('participants.show');
                Route::get('/{slug}/facture/{reference}', 'downloadInvoice')->name('participants.invoice');

                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');

                Route::patch('/{event}/toggle-publish', 'togglePublish')->name('toggle-publish');

                Route::get('/{event}', 'show')->name('show');
                Route::get('/{event}/edit', 'edit')->name('edit');
                Route::post('/{event}', 'update')->name('update');
                Route::delete('/{event}', 'destroy')->name('destroy');
            });


        /*
        |--------------------------------------------------------------------------
        | Trainings
        |--------------------------------------------------------------------------
        */

        Route::prefix('trainings')
            ->name('trainings.')
            ->controller(TrainingController::class)
            ->group(function () {
                Route::get('/trash', 'trash')->name('trash');

                Route::get('/participants/{slug}', 'participants')->name('participants');
                Route::get('/participants/{slug}/export', 'exportParticipantsCsv')->name('participants.export');
                Route::get('/{slug}/participants/{participant}', 'showParticipant')->name('participants.show');
                Route::get('/{slug}/facture/{reference}', 'downloadInvoice')->name('participants.invoice');

                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');

                Route::patch('/{training}/toggle-publish', 'togglePublish')->name('toggle-publish');

                Route::get('/{training}', 'show')->name('show');
                Route::get('/{training}/edit', 'edit')->name('edit');
                Route::post('/{training}', 'update')->name('update');
                Route::delete('/{training}', 'destroy')->name('destroy');
            });


        /*
        |--------------------------------------------------------------------------
        | Testimonials
        |--------------------------------------------------------------------------
        */

        Route::prefix('testimonials')
            ->name('testimonials.')
            ->controller(TestimonialController::class)
            ->group(function () {
                Route::post('/reorder-home', 'reorderHome')->name('reorderHome');

                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');

                Route::get('/{testimonial}/edit', 'edit')->name('edit');
                Route::post('/{testimonial}', 'update')->name('update');
                Route::delete('/{testimonial}', 'destroy')->name('destroy');

                Route::patch('/{testimonial}/toggle-home', 'toggleHome')->name('toggleHome');
                Route::patch('/{testimonial}/toggle-featured', 'toggleFeatured')->name('toggleFeatured');
            });
    });
});