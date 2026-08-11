<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CoachConversationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'module' => 'general',
            'title' => fake()->sentence(4),
            'language' => 'fr',
            'status' => 'active',
            'context' => null,
        ];
    }
}
