<?php

namespace App\Http\Middleware;

use App\Coach\Services\CoachSettingsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCoachIsEnabled
{
    public function __construct(private readonly CoachSettingsService $settings) {}

    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($this->settings->enabled(), 403, 'Le Coach numérique est temporairement désactivé.');

        return $next($request);
    }
}
