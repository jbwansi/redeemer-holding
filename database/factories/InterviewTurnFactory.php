<?php

namespace Database\Factories;

use App\Models\InterviewSimulation;
use Illuminate\Database\Eloquent\Factories\Factory;

class InterviewTurnFactory extends Factory
{
    public function definition(): array
    {
        return [
            'interview_simulation_id' => InterviewSimulation::factory(),
            'position' => 1,
            'category' => 'motivation',
            'question' => 'Pourquoi souhaitez-vous rejoindre cette entreprise ?',
        ];
    }
}
