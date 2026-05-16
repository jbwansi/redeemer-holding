<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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

Route::middleware(['auth'])->group(function () {

    Route::controller(AuthController::class)->group(function () {

        // Logout
        Route::post('/logout', 'logout')
            ->name('logout');


        // Auto logout on browser close
        if (app()->isProduction()) {

            Route::post('/logout-on-close', 'logoutOnClose')
                ->name('logout.on.close');
        }
    });
});