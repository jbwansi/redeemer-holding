<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Events\DiagnosingHealth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use App\Coach\AI\AIProviderInterface;
use App\Coach\AI\FakeAIProvider;
use App\Coach\AI\UnsupportedAIProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Coach\Services\CoachSettingsService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Gate::define('administer', fn (User $user): bool => $user->isAdmin());
        $this->app->bind(AIProviderInterface::class, function () {
            $provider = app(CoachSettingsService::class)->all()['provider'] ?? 'fake';

            return $provider === 'fake'
                ? new FakeAIProvider()
                : new UnsupportedAIProvider((string) $provider);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(DiagnosingHealth::class, static function (): void {
            DB::select('select 1');
        });
        RateLimiter::for('coach-ai', fn ($request) => Limit::perMinute((int) app(CoachSettingsService::class)->all()['rate_limit_per_minute'])->by((string) $request->user()->id));
    }
}
