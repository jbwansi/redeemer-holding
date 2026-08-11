<?php

namespace App\Coach\Services;

use App\Models\CoachConversation;
use App\Models\User;

class CoachContextService
{
    public function build(User $user, CoachConversation $conversation, string $message, array $documentIds = []): array
    {
        abort_unless($conversation->user_id === $user->id, 404);
        $documents = $user->coachDocuments()->whereKey($documentIds)->get(['id', 'type', 'original_name', 'language']);
        $profile = $user->professionalProfile;
        $history = $conversation->messages()
            ->whereIn('role', ['user', 'assistant'])
            ->latest('id')
            ->limit(10)
            ->get(['role', 'content'])
            ->reverse()
            ->values();

        return [
            'language' => $conversation->language,
            'professional_profile_data' => $profile?->only([
                'professional_title', 'summary', 'career_objective', 'target_roles', 'target_sectors', 'languages',
            ]),
            'document_data' => $documents->toArray(),
            'conversation_history' => $history->toArray(),
            'current_user_message' => $message,
        ];
    }
}
