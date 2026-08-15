<?php

namespace App\Services;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use App\Services\DynamicMailerService;
use Illuminate\Auth\Events\Registered;

class AuthenticationService
{
    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }

    public function authenticate(LoginRequest $request): void
    {
        try {
            $request->authenticate();
        } catch (\Exception $e) {

            throw $e;
        }
    }
    public function register(RegisterRequest $request): User
    {
        try {
            $userData = $request->validated();

            // Combiner prénom et nom en un seul champ name
            $userData['name'] = trim($userData['first_name'] . ' ' . $userData['last_name']);
            unset($userData['first_name'], $userData['last_name']);

            // Gestion du mot de passe
            $userData['password'] = Hash::make($userData['password']);
            $userData['role'] = 'client';

            // Champs front-only a ignorer en base
            unset($userData['terms']);

            // Création de l'utilisateur
            $user = User::create($userData)->refresh();
            event(new Registered($user));
            $this->dynamicMailerService->send(new WelcomeMail($user), $user->email);
            // Connexion automatique
            Auth::login($user);

            return $user;
        } catch (\Exception $e) {
            throw $e;
        }
    }


    public function logout(): void
    {


        Auth::logout();
    }
}
