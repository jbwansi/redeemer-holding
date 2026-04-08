<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OnlyTestUsers
{
    /**
     * Allow only selected users on staging/testing environments.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!app()->environment(['staging', 'testing'])) {
            return $next($request);
        }

        $allowedRouteNames = [
            'login',
            'register.page',
            'password.request',
            'register',
        ];

        if ($request->route() && in_array($request->route()->getName(), $allowedRouteNames, true)) {
            return $next($request);
        }

        if (!$request->user()) {
            return redirect()->route('login');
        }

        if ($request->user()->role === 'admin') {
            return $next($request);
        }

        $envEmailsRaw = (string) ($_ENV['TEST_ALLOWED_EMAILS'] ?? '');
        $settingEmailsRaw = (string) get_setting('test_allowed_emails', '');

        $emails = collect([$envEmailsRaw, $settingEmailsRaw])
            ->flatMap(function (string $source) {
                $normalized = str_replace(["\r\n", "\r"], "\n", $source);
                $normalized = str_replace(';', ',', $normalized);

                return preg_split('/[\n,]+/', $normalized) ?: [];
            })
            ->map(fn ($email) => trim(strtolower((string) $email)))
            ->filter()
            ->unique()
            ->values();

        if ($emails->isEmpty()) {
            abort(403, 'Aucun utilisateur test n\'est configuré pour cet environnement.');
        }

        $currentEmail = strtolower((string) $request->user()->email);

        if ($emails->contains($currentEmail)) {
            return $next($request);
        }

        abort(403, 'Votre compte ne fait pas partie des testeurs autorisés.');
    }
}
