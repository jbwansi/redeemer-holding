<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /** Seed explicitly configured test users. */
    public function run(): void
    {
        if (!app()->environment(['local', 'staging'])) {
            $this->command?->warn('TestUsersSeeder ignoré hors des environnements local et staging.');

            return;
        }

        $password = trim((string) env('TEST_USERS_PASSWORD', ''));

        $emails = collect(explode(',', (string) env('TEST_ALLOWED_EMAILS', '')))
            ->map(fn ($email) => trim($email))
            ->filter()
            ->values();

        if ($emails->isEmpty() || $password === '') {
            $this->command?->warn('Aucun compte de test créé : TEST_ALLOWED_EMAILS et TEST_USERS_PASSWORD doivent être configurés explicitement.');

            return;
        }

        foreach ($emails as $index => $email) {
            $number = $index + 1;

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => "Testeur {$number}",
                    'password' => Hash::make($password),
                    'role' => 'client',
                    'is_active' => 1,
                ]
            );
        }
    }
}
