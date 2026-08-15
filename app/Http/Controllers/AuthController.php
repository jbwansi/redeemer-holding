<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthenticationService;
use App\Services\SettingsService;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\TrainingRegistrationLinkService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class AuthController extends Controller
{

    public function __construct(
        private readonly AuthenticationService $authService,
        private readonly SettingsService $settingsService,
        private readonly TrainingRegistrationLinkService $registrationLinkService,
    ) {
    }


    public function show_auth(Request $request)
    {
        $isRegistration = $request->routeIs('register.page');
        $registrationEnabled = $this->isRegistrationEnabled();

        return inertia("Frontend/auth", [
            'registrationEnabled' => $registrationEnabled,
            'initialMode' => $isRegistration && $registrationEnabled ? 'register' : 'login',
            'suggestedEmail' => $this->registrationLinkService->pendingEmail(),
            'seo' => SeoService::page(
                $isRegistration ? 'Inscription' : 'Connexion',
                $isRegistration
                    ? 'Créez votre compte Redeemer Holding.'
                    : 'Connectez-vous à votre compte Redeemer Holding.',
                extra: ['robots' => 'noindex, follow'],
            ),
        ]);
    }

    public function password_request()
    {
        return inertia("Frontend/auth", [
            'registrationEnabled' => $this->isRegistrationEnabled(),
            'seo' => SeoService::page(
                'Réinitialisation du mot de passe',
                'Réinitialisez l’accès à votre compte Redeemer Holding.',
                extra: ['robots' => 'noindex, follow'],
            ),
        ]);
    }



    public function login(LoginRequest $request)
    {
        $this->authService->authenticate($request);


        return $this->authenticatedRedirect($request);
    }
    public function register(RegisterRequest $request)
    {
        if (!$this->isRegistrationEnabled()) {
            return redirect()
                ->route('login')
                ->with('error', 'Les inscriptions sont temporairement desactivees.');
        }

        $user = $this->authService->register($request);
        return $this->authenticatedRedirect($request);
    }

    public function verificationNotice(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('training-registration.claim');
        }

        return inertia('Frontend/auth', [
            'registrationEnabled' => $this->isRegistrationEnabled(),
            'emailVerificationRequired' => true,
            'verificationEmail' => $request->user()->email,
            'status' => session('status'),
        ]);
    }

    public function sendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('training-registration.claim');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }

    public function verifyEmail(EmailVerificationRequest $request)
    {
        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->route('training-registration.claim');
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

    private function authenticatedRedirect(Request $request)
    {
        if ($this->registrationLinkService->hasPending()) {
            return $request->user()->hasVerifiedEmail()
                ? redirect()->route('training-registration.claim')
                : redirect()->route('verification.notice');
        }

        return $request->user()->can('administer')
            ? redirect()->route('dashboard')
            : redirect()->route('dashboard.client.profile');
    }
}
