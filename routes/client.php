<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AccountController;
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

            Route::get('/formations', 'formation')
                ->name('formations');

            Route::get('/events', 'event')
                ->name('events');

            Route::get('/account', 'account')
                ->name('account');
        });
});