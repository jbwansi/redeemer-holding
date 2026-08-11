<?php

namespace Database\Factories;

use App\Models\CoachConversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CoachUsageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'coach_conversation_id' => CoachConversation::factory(),
            'module' => 'general',
            'operation' => 'message',
            'provider' => 'fake',
            'model' => 'fake-v1',
            'prompt_key' => 'coach.general',
            'prompt_version' => '1.0',
            'input_tokens' => 20,
            'output_tokens' => 10,
            'estimated_cost_micros' => 0,
            'duration_ms' => 5,
            'status' => 'success',
            'correlation_id' => Str::uuid(),
        ];
    }
}
