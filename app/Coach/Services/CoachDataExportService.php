<?php

namespace App\Coach\Services;

use App\Models\User;

class CoachDataExportService
{
    public function export(User $user): array
    {
        return [
            'exported_at' => now()->toIso8601String(),
            'user_id' => $user->id,
            'professional_profile' => $user->professionalProfile?->toArray(),
            'documents' => $user->coachDocuments()->get([
                'id', 'type', 'original_name', 'mime_type', 'size', 'language', 'status', 'created_at',
            ])->toArray(),
            'conversations' => $user->coachConversations()->with('messages')->get()->toArray(),
            'interview_simulations' => $user->interviewSimulations()->with('turns')->get()->toArray(),
            'analyses' => $user->coachAnalyses()->get()->toArray(),
            'career_goals' => $user->careerGoals()->with('actions')->get()->toArray(),
        ];
    }
}
