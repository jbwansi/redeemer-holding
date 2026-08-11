<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Events\DiagnosingHealth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Gate::define('administer', fn (User $user): bool => $user->isAdmin());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(DiagnosingHealth::class, static function (): void {
            DB::select('select 1');
        });
    }
}
