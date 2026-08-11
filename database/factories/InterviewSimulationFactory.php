<?php

namespace Database\Factories;

use App\Models\CoachConversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InterviewSimulationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'coach_conversation_id' => CoachConversation::factory(),
            'job_title' => fake()->jobTitle(),
            'company_name' => fake()->company(),
            'job_description' => fake()->paragraph(),
            'interview_type' => 'general',
            'difficulty' => 'standard',
            'language' => 'fr',
            'status' => 'ready',
            'current_turn' => 1,
        ];
    }
}
