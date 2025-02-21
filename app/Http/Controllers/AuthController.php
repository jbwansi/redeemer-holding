<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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


        if (Auth::user()->role == 'admin') {
            return redirect()->route('dashboard');
        } else {
            return redirect()->route('dashboard.client.profile');
        }
    }
    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request);
        if (Auth::user()->role == 'admin') {
            return redirect()->route('dashboard');
        } else {
            return redirect()->route('dashboard.client.profile');
        }
    }
    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
