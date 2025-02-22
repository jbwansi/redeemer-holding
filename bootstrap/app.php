<?php

use App\Http\Middleware\CheckUserRole;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'active' => EnsureUserIsActive::class,
            'role' => CheckUserRole::class,
        ]);
    })
    ->withCommands([
        // Ajouter vos commandes personnalisées ici
        \App\Console\Commands\SendActivityReminders::class,
    ])
    ->withSchedule(function (Schedule $schedule) {
        // Planification des tâches
        $schedule->command('reminders:send')->dailyAt('09:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
