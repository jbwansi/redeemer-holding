<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Redirect HTTP requests to HTTPS in production when explicitly enabled.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!app()->isProduction() || !filter_var(env('FORCE_HTTPS', false), FILTER_VALIDATE_BOOL)) {
            return $next($request);
        }

        $forwardedProto = strtolower((string) $request->header('X-Forwarded-Proto', ''));
        $alreadySecure = $request->isSecure() || str_contains($forwardedProto, 'https');

        if ($alreadySecure) {
            return $next($request);
        }

        return redirect()->secure($request->getRequestUri(), 301);
    }
}
