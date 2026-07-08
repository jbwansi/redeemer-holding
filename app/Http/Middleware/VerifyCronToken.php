<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyCronToken
{
    /**
     * Protect sensitive cron-style endpoints with a shared secret token.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->runningUnitTests()) {
            return $next($request);
        }

        $configuredToken = (string) env('REMINDER_CRON_TOKEN', '');
        if ($configuredToken === '') {
            abort(503, 'REMINDER_CRON_TOKEN is not configured.');
        }

        $providedToken = (string) ($request->header('X-Cron-Token')
            ?? $request->bearerToken()
            ?? $request->query('token')
            ?? '');

        if (!hash_equals($configuredToken, $providedToken)) {
            abort(403, 'Invalid cron token.');
        }

        return $next($request);
    }
}
