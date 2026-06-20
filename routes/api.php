<?php

use App\Http\Controllers\Admin\ActivityReminderController;
use App\Http\Controllers\Frontend\ChatbotController;
use Illuminate\Support\Facades\Route;

Route::post('/reminders/send', [ActivityReminderController::class, 'send'])
    ->name('api.reminders.send');

Route::post('/chatbot/message', [ChatbotController::class, 'message'])
    ->middleware('throttle:30,1')
    ->name('api.chatbot.message');

Route::get('/chatbot/config', [ChatbotController::class, 'config'])
    ->middleware('throttle:60,1')
    ->name('api.chatbot.config');

Route::post('/chatbot/lead', [ChatbotController::class, 'lead'])
    ->middleware('throttle:20,1')
    ->name('api.chatbot.lead');


