<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAdminAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return redirect()
                ->route('login')
                ->with('error', 'Veuillez vous connecter pour acceder au dashboard administrateur.');
        }

        if ($request->user()->role !== 'admin') {
            return redirect()
                ->route('home')
                ->with('error', 'Acces reserve aux administrateurs.');
        }

        return $next($request);
    }
}
