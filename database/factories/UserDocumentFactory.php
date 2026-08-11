<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => 'cv',
            'original_name' => 'cv.pdf',
            'path' => Str::uuid().'.pdf',
            'disk' => 'coach_private',
            'mime_type' => 'application/pdf',
            'size' => 1024,
            'language' => 'fr',
            'sha256' => hash('sha256', fake()->uuid()),
            'status' => 'uploaded',
        ];
    }
}
