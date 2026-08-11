<?php

namespace App\Coach\Services;

use App\Models\CoachConversation;
use App\Models\CoachUsage;
use App\Models\User;

class CoachUsageService
{
    public function __construct(private CoachSettingsService $settings) {}

    public function ensureWithinQuota(User $user): void
    {
        $limit = (int) $this->settings->all()['monthly_message_limit'];
        $count = CoachUsage::where('user_id', $user->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        abort_if($count >= $limit, 429, 'Votre limite mensuelle Coach est atteinte.');
    }

    public function record(
        User $user,
        CoachConversation $conversation,
        string $status,
        string $correlationId,
        string $promptKey,
        string $promptVersion,
        int $input = 0,
        int $output = 0,
        int $duration = 0,
        string $operation = 'message',
    ): void {
        $provider = (string) $this->settings->all()['provider'];
        CoachUsage::create([
            'user_id' => $user->id,
            'coach_conversation_id' => $conversation->id,
            'module' => $conversation->module,
            'operation' => $operation,
            'provider' => $provider,
            'model' => $provider === 'fake' ? 'fake-v1' : null,
            'prompt_key' => $promptKey,
            'prompt_version' => $promptVersion,
            'input_tokens' => $input,
            'output_tokens' => $output,
            'estimated_cost_micros' => 0,
            'duration_ms' => $duration,
            'status' => $status,
            'correlation_id' => $correlationId,
        ]);
    }
}
