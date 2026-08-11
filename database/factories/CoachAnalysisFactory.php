<?php

namespace Database\Factories;

use App\Models\CoachConversation;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CoachAnalysisFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'coach_conversation_id' => CoachConversation::factory(),
            'cv_document_id' => UserDocument::factory(),
            'job_document_id' => UserDocument::factory()->state(['type' => 'job_offer']),
            'job_title' => 'Product Manager',
            'company_name' => 'Redeemer Holding',
            'language' => 'fr',
            'status' => 'completed',
            'analysis_type' => 'cv_job_match',
            'result' => [],
            'prompt_key' => 'cv.compare',
            'prompt_version' => '1.0',
            'submission_token' => (string) Str::uuid(),
            'completed_at' => now(),
        ];
    }
}
