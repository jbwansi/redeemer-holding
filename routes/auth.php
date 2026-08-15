<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\LearningQuizController;
use App\Http\Controllers\LearningResourceController;
use App\Http\Controllers\TrainingProgressController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['guest'])->group(function () {

    // =========================
    // Login
    // =========================

    Route::controller(AuthController::class)->group(function () {

        Route::get('/login', 'show_auth')
            ->name('login');

        Route::post('/login', 'login')
            ->middleware('throttle:10,1')
            ->name('login.submit');
    });


    // =========================
    // Register
    // =========================

    Route::controller(AuthController::class)->group(function () {

        Route::get('/inscription', 'show_auth')
            ->name('register.page');

        Route::post('/register', 'register')
            ->middleware('throttle:5,1')
            ->name('register');
    });


    // =========================
    // Password Reset
    // =========================

    Route::controller(AuthController::class)->group(function () {

        Route::get('/password/request', 'password_request')
            ->name('password.request');
    });
});


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'active'])
    ->prefix('learning')
    ->name('learning.')
    ->group(function () {
        Route::get('/', [LearningController::class, 'index'])->name('index');
        Route::get('/{training}', [LearningController::class, 'show'])->name('show');
        Route::get('/{training}/lessons/{lesson}', [LearningController::class, 'lesson'])->name('lesson');
        Route::get('/{training}/sections/{section}/quiz', [LearningQuizController::class, 'show'])->name('quiz.show');
        Route::post('/{training}/sections/{section}/quiz', [LearningQuizController::class, 'submit'])->name('quiz.submit');

        Route::post('/{training}/lessons/{lesson}/complete', [TrainingProgressController::class, 'complete'])
            ->name('lessons.complete');
        Route::post('/{training}/lessons/{lesson}/uncomplete', [TrainingProgressController::class, 'uncomplete'])
            ->name('lessons.uncomplete');

        Route::get('/resources/{resource}/download', [LearningResourceController::class, 'download'])
            ->name('resources.download');
    });

Route::get('/inscriptions-formations/rattacher', [\App\Http\Controllers\Frontend\TrainingController::class, 'claimRegistration_formation'])
    ->middleware(['auth', 'active', 'verified'])
    ->name('training-registration.claim');

Route::middleware(['auth'])->group(function () {

    Route::controller(AuthController::class)->group(function () {

        // Logout
        Route::post('/logout', 'logout')
            ->name('logout');

        Route::get('/email/verify', 'verificationNotice')
            ->name('verification.notice');
        Route::post('/email/verification-notification', 'sendVerification')
            ->middleware('throttle:6,1')
            ->name('verification.send');
        Route::get('/email/verify/{id}/{hash}', 'verifyEmail')
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');


        // Auto logout on browser close
        if (app()->isProduction()) {

            Route::post('/logout-on-close', 'logoutOnClose')
                ->name('logout.on.close');
        }
    });
});
