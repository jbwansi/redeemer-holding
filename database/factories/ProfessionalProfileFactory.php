<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfessionalProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'professional_title' => fake()->jobTitle(),
            'summary' => fake()->paragraph(),
            'career_objective' => fake()->sentence(),
            'default_language' => 'fr',
            'target_roles' => [fake()->jobTitle()],
            'target_sectors' => ['Technologie'],
            'languages' => ['fr'],
        ];
    }
}
