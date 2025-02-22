<?php

use App\Http\Controllers\Admin\ActivityReminderController;
use Illuminate\Support\Facades\Route;

Route::post('/reminders/send', [ActivityReminderController::class, 'send'])
    ->name('api.reminders.send');
