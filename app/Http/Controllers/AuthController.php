<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Services\AuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    public function __construct(
        private readonly AuthenticationService $authService,
    ) {}


    public function show_auth()
    {
        return inertia("frontend/auth");
    }


    public function login(LoginRequest $request)
    {
        $this->authService->authenticate($request);

        return redirect()->route('dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
