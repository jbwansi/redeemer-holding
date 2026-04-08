<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Seed test users allowed on staging/testing.
     */
    public function run(): void
    {
        $password = (string) env('TEST_USERS_PASSWORD', 'Test1234!');

        $emails = collect(explode(',', (string) env('TEST_ALLOWED_EMAILS', '')))
            ->map(fn ($email) => trim($email))
            ->filter()
            ->values();

        if ($emails->isEmpty()) {
            $emails = collect([
                'testeur1@example.com',
                'testeur2@example.com',
            ]);
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
