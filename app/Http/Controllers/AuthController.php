<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthenticationService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    public function __construct(
        private readonly AuthenticationService $authService,
        private readonly SettingsService $settingsService,
    ) {
    }


    public function show_auth()
    {
        return inertia("frontend/auth", [
            'registrationEnabled' => $this->isRegistrationEnabled(),
        ]);
    }

    public function password_request()
    {
        return inertia("frontend/auth", [
            'registrationEnabled' => $this->isRegistrationEnabled(),
        ]);
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
        if (!$this->isRegistrationEnabled()) {
            return redirect()
                ->route('login')
                ->with('error', 'Les inscriptions sont temporairement desactivees.');
        }

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

    public function logoutOnClose(Request $request)
    {
        if (!Auth::check()) {
            return response()->noContent();
        }

        Auth::logout();

        $request->session()->invalidate();

        return response()->noContent();
    }

    private function isRegistrationEnabled(): bool
    {
        $value = $this->settingsService->getSetting('enable_registration');

        return $value === null
            || $value === true
            || $value === 1
            || $value === '1'
            || $value === 'true';
    }
}
