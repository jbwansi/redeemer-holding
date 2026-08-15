<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ChatbotController;
use App\Http\Controllers\Admin\ChatbotLeadController;
use App\Http\Controllers\Admin\CoachController;
use App\Http\Controllers\Admin\ConfigController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\EventCheckInController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\PageContentController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\SearchController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\TrainingController;
use App\Http\Controllers\Admin\TrainingLessonController;
use App\Http\Controllers\Admin\TrainingQuizController;
use App\Http\Controllers\Admin\TrainingResourceController;
use App\Http\Controllers\Admin\TrainingSectionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\TrainingProgressController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['admin.access', 'active'])->group(function () {
    Route::get('/admin/coach', [CoachController::class, 'index'])->name('admin.coach.index');
    Route::put('/admin/coach/settings', [CoachController::class, 'update'])->name('admin.coach.settings.update');

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
                Route::post('/trainings/bulk-assign', [UserController::class, 'bulkAssignTraining'])
                    ->name('trainings.bulk-assign');
                Route::post('/{user}/trainings/assign', [UserController::class, 'assignTraining'])
                    ->name('trainings.assign');
                Route::post('/{user}/trainings/{participant}/unassign', [UserController::class, 'unassignTraining'])
                    ->name('trainings.unassign');
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

        // Google Analytics visitors by country
        Route::get('/analytics/countries', [\App\Http\Controllers\AnalyticsController::class, 'visitorsByCountry']);

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
                Route::get('/{event:slug}/scanner', [EventCheckInController::class, 'show'])->name('scanner');
                Route::post('/{event:slug}/check-in', [EventCheckInController::class, 'store'])
                    ->middleware('throttle:60,1')
                    ->name('check-in');
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
            ->group(function () {
                Route::get('/trash', [TrainingController::class, 'trash'])->name('trash');

                Route::get('/participants/{slug}', [TrainingController::class, 'participants'])->name('participants');
                Route::get('/participants/{slug}/export', [TrainingController::class, 'exportParticipantsCsv'])->name('participants.export');
                Route::get('/{slug}/participants/{participant}', [TrainingController::class, 'showParticipant'])->name('participants.show');
                Route::get('/{slug}/facture/{reference}', [TrainingController::class, 'downloadInvoice'])->name('participants.invoice');

                Route::post('/import-json', [TrainingController::class, 'importJson'])
                    ->name('import-json');

                Route::post('/{training}/import-sections', [TrainingController::class, 'importSections'])
                    ->name('import-sections');

                Route::get('/{training}/sections', [TrainingSectionController::class, 'index'])
                    ->name('sections.index');

                Route::get('/{training}/sections/create', [TrainingSectionController::class, 'create'])
                    ->name('sections.create');

                Route::post('/{training}/sections', [TrainingSectionController::class, 'store'])
                    ->name('sections.store');

                Route::get('/{training}/sections/{section}/edit', [TrainingSectionController::class, 'edit'])
                    ->name('sections.edit');

                Route::put('/{training}/sections/{section}', [TrainingSectionController::class, 'update'])
                    ->name('sections.update');

                Route::delete('/{training}/sections/{section}', [TrainingSectionController::class, 'destroy'])
                    ->name('sections.destroy');

                Route::get('/{training}/sections/{section}/quiz', [TrainingQuizController::class, 'edit'])
                    ->name('sections.quiz.edit');

                Route::put('/{training}/sections/{section}/quiz', [TrainingQuizController::class, 'update'])
                    ->name('sections.quiz.update');

                Route::post('/{training}/lessons/{lesson}/complete', [TrainingProgressController::class, 'complete'])
                    ->name('lessons.complete');

                Route::post('/{training}/lessons/{lesson}/uncomplete', [TrainingProgressController::class, 'uncomplete'])
                    ->name('lessons.uncomplete');

                Route::prefix('/{training}/sections/{section}/lessons')
                    ->name('sections.lessons.')
                    ->group(function () {
                        Route::get('/create', [TrainingLessonController::class, 'create'])->name('create');
                        Route::post('/', [TrainingLessonController::class, 'store'])->name('store');
                        Route::get('/{lesson}', [TrainingLessonController::class, 'show'])->name('show');
                        Route::get('/{lesson}/edit', [TrainingLessonController::class, 'edit'])->name('edit');
                        Route::put('/{lesson}', [TrainingLessonController::class, 'update'])->name('update');
                        Route::delete('/{lesson}', [TrainingLessonController::class, 'destroy'])->name('destroy');
                    });

                Route::post('/{training}/sections/reorder', [TrainingSectionController::class, 'reorder'])
                    ->name('sections.reorder');

                Route::post('/{training}/sections/{section}/lessons/reorder', [TrainingLessonController::class, 'reorder'])
                    ->name('sections.lessons.reorder');
                Route::get('/{training}/lessons/{lesson}/resources', [TrainingResourceController::class, 'index'])->name('lessons.resources.index');
                Route::get('/{training}/lessons/{lesson}/resources/create', [TrainingResourceController::class, 'create'])->name('lessons.resources.create');
                Route::post('/{training}/lessons/{lesson}/resources', [TrainingResourceController::class, 'store'])->name('lessons.resources.store');
                Route::post('/{training}/lessons/{lesson}/resources/reorder', [TrainingResourceController::class, 'reorder'])->name('lessons.resources.reorder');
                Route::get('/{training}/lessons/{lesson}/resources/{resource}/edit', [TrainingResourceController::class, 'edit'])->name('lessons.resources.edit');
                Route::put('/{training}/lessons/{lesson}/resources/{resource}', [TrainingResourceController::class, 'update'])->name('lessons.resources.update');
                Route::delete('/{training}/lessons/{lesson}/resources/{resource}', [TrainingResourceController::class, 'destroy'])->name('lessons.resources.destroy');

                Route::get('/', [TrainingController::class, 'index'])->name('index');
                Route::get('/create', [TrainingController::class, 'create'])->name('create');
                Route::post('/', [TrainingController::class, 'store'])->name('store');

                Route::patch('/{training}/toggle-publish', [TrainingController::class, 'togglePublish'])->name('toggle-publish');

                Route::get('/{training}', [TrainingController::class, 'show'])->name('show');
                Route::get('/{training}/edit', [TrainingController::class, 'edit'])->name('edit');
                Route::post('/{training}', [TrainingController::class, 'update'])->name('update');
                Route::delete('/{training}', [TrainingController::class, 'destroy'])->name('destroy');
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
