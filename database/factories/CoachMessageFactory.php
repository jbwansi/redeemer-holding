<?php

namespace Database\Factories;

use App\Models\CoachConversation;
use Illuminate\Database\Eloquent\Factories\Factory;

class CoachMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'coach_conversation_id' => CoachConversation::factory(),
            'role' => 'user',
            'content' => fake()->sentence(),
            'structured_data' => null,
            'input_tokens' => 0,
            'output_tokens' => 0,
        ];
    }
}
