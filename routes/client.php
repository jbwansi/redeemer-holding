<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Coach\CoachConversationController;
use App\Http\Controllers\Coach\CoachDashboardController;
use App\Http\Controllers\Coach\CoachMessageController;
use App\Http\Controllers\Coach\InterviewSimulationController;
use App\Http\Controllers\Coach\ProfessionalProfileController;
use App\Http\Controllers\Coach\UserDocumentController;
use App\Http\Controllers\Frontend\DashboardController;

/*
|--------------------------------------------------------------------------
| Client Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'active'])->group(function () {

    // =========================
    // Shared Account Routes
    // =========================

    Route::prefix('profile')
        ->name('profile.')
        ->controller(AccountController::class)
        ->group(function () {

            Route::post('/update', 'updateProfile')
                ->name('update');

            Route::post('/password', 'updatePassword')
                ->name('password.update');
        });


    // =========================
    // Inactive Account
    // =========================

    Route::get('/account/inactive', [AccountController::class, 'inactive'])
        ->name('account.inactive');


    // =========================
    // Client Dashboard
    // =========================

    Route::prefix('dashboard-client')
        ->name('dashboard.client.')
        ->controller(DashboardController::class)
        ->group(function () {

            Route::get('/profile', 'index')
                ->name('profile');

            Route::get('/trainings', 'training')
                ->name('trainings');

            Route::get('/events', 'event')
                ->name('events');

            Route::get('/trainings/{slug}/acces', 'trainingAccess')
                ->name('trainings.access');

            Route::get('/account', 'account')
                ->name('account');
        });

    // =========================
    // Digital Coach
    // =========================

    Route::middleware('coach.enabled')
        ->prefix('dashboard-client/coach')
        ->name('coach.')
        ->group(function () {
            Route::get('/', CoachDashboardController::class)->name('dashboard');

            Route::get('/profile', [ProfessionalProfileController::class, 'edit'])->name('profile.edit');
            Route::put('/profile', [ProfessionalProfileController::class, 'update'])->name('profile.update');

            Route::get('/documents', [UserDocumentController::class, 'index'])->name('documents.index');
            Route::post('/documents', [UserDocumentController::class, 'store'])->name('documents.store');
            Route::get('/documents/{document}/download', [UserDocumentController::class, 'download'])->name('documents.download');
            Route::delete('/documents/{document}', [UserDocumentController::class, 'destroy'])->name('documents.destroy');

            Route::post('/conversations', [CoachConversationController::class, 'store'])->name('conversations.store');
            Route::get('/conversations/{conversation}', [CoachConversationController::class, 'show'])->name('conversations.show');
            Route::patch('/conversations/{conversation}/archive', [CoachConversationController::class, 'archive'])->name('conversations.archive');
            Route::delete('/conversations/{conversation}', [CoachConversationController::class, 'destroy'])->name('conversations.destroy');
            Route::post('/conversations/{conversation}/messages', [CoachMessageController::class, 'store'])
                ->middleware('throttle:coach-ai')
                ->name('conversations.messages.store');

            Route::get('/interviews', [InterviewSimulationController::class, 'index'])->name('interviews.index');
            Route::get('/interviews/create', [InterviewSimulationController::class, 'create'])->name('interviews.create');
            Route::post('/interviews', [InterviewSimulationController::class, 'store'])
                ->middleware('throttle:coach-ai')
                ->name('interviews.store');
            Route::get('/interviews/{simulation}', [InterviewSimulationController::class, 'show'])->name('interviews.show');
            Route::post('/interviews/{simulation}/retry', [InterviewSimulationController::class, 'retry'])
                ->middleware('throttle:coach-ai')
                ->name('interviews.retry');
            Route::post('/interviews/{simulation}/answers', [InterviewSimulationController::class, 'answer'])
                ->middleware('throttle:coach-ai')
                ->name('interviews.answers.store');
            Route::get('/interviews/{simulation}/debrief', [InterviewSimulationController::class, 'debrief'])->name('interviews.debrief');
        });
});
