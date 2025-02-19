<?php

namespace App\Services;

use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Auth;

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


    public function logout(): void
    {


        Auth::logout();
    }
}
