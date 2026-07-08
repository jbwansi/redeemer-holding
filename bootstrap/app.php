<?php

use App\Http\Middleware\CheckUserRole;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\ForceHttps;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\OnlyTestUsers;
use App\Http\Middleware\RespectMaintenanceMode;
use App\Http\Middleware\RequireAdminAccess;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\VerifyCronToken;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',  // Cette ligne est importante
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
            'stripe/webhook/trainings',
        ]);
        $middleware->web(prepend: [
            ForceHttps::class,
        ]);
        $middleware->web(append: [
            HandleInertiaRequests::class,
            OnlyTestUsers::class,
            RespectMaintenanceMode::class,
            SecurityHeaders::class,
        ]);
        $middleware->alias([
            'active' => EnsureUserIsActive::class,
            'role' => CheckUserRole::class,
            'admin.access' => RequireAdminAccess::class,
            'test.users' => OnlyTestUsers::class,
            'cron.token' => VerifyCronToken::class,
        ]);
    })
    ->withCommands([
        // Ajouter vos commandes personnalisées ici
        \App\Console\Commands\SendActivityReminders::class,
        \App\Console\Commands\QueueHealthCheck::class,
    ])
    ->withSchedule(function (Schedule $schedule) {
        // Planification des tâches
        $schedule->command('reminders:send')->dailyAt('09:00');
        $schedule->command('queue:health-check --max-pending=300 --max-failed=20 --max-oldest-minutes=20')
            ->everyFiveMinutes()
            ->withoutOverlapping();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
