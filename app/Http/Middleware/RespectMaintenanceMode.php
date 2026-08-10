<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class RespectMaintenanceMode
{
    private const CACHE_KEY = 'app_settings';
    private const CACHE_TTL = 3600;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Keep admin area and authentication paths reachable.
        if (
            $request->is('dashboard*')
            || $request->is('login')
            || $request->is('inscription')
            || $request->is('password/*')
            || $request->is('newsletter/unsubscribe/*')
        ) {
            return $next($request);
        }

        // Allow admins to browse the public site while maintenance is active.
        if ($request->user()?->can('administer')) {
            return $next($request);
        }

        $settings = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Setting::query()->pluck('value', 'type')->toArray();
        });

        $isMaintenanceEnabled = $this->isEnabled($settings['maintenance_mode'] ?? false);
        if (!$isMaintenanceEnabled) {
            return $next($request);
        }

        $endDate = $settings['maintenance_end_date'] ?? null;
        if (is_string($endDate) && trim($endDate) !== '') {
            try {
                if (Carbon::parse($endDate)->isPast()) {
                    return $next($request);
                }
            } catch (\Throwable $e) {
                // If end date is malformed, fallback to active maintenance.
            }
        }

        $message = (string) ($settings['maintenance_message'] ?? 'Le site est temporairement en maintenance.');

        return response()
            ->view('maintenance', [
                'message' => $message,
                'endDate' => $endDate,
            ], 503);
    }

    private function isEnabled(mixed $value): bool
    {
        return $value === true
            || $value === 1
            || $value === '1'
            || $value === 'true';
    }
}
