<?php

namespace App\Services;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;

class AuthenticationService
{
    public function __construct() {}

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

            // Gestion du mot de passe
            $userData['password'] = Hash::make($userData['password']);

            // Création de l'utilisateur
            $user = User::create($userData);
            Mail::to($user->email)->send(new WelcomeMail($user));
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
