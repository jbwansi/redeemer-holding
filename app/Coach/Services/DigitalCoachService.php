<?php

namespace App\Coach\Services;

use App\Coach\AI\AIProviderInterface;
use App\Coach\DTO\AIRequest;
use App\Coach\Prompts\PromptRegistry;
use App\Models\CoachConversation;
use App\Models\CoachMessage;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;
use App\Coach\DTO\StructuredAIResponse;

class DigitalCoachService
{
    public function __construct(
        private AIProviderInterface $provider,
        private CoachContextService $contexts,
        private CoachUsageService $usage,
        private PromptRegistry $prompts,
        private CoachSettingsService $settings,
    ) {}

    public function respond(User $user, CoachConversation $conversation, string $content, array $documentIds = []): CoachMessage
    {
        abort_unless($this->settings->enabled(), 403, 'Le Coach numérique est temporairement désactivé.');
        abort_unless($conversation->user_id === $user->id, 404);
        abort_unless($conversation->module === 'general' && $this->settings->moduleEnabled($conversation->module), 403);
        $this->usage->ensureWithinQuota($user);

        $prompt = $this->prompts->forModule($conversation->module);
        $context = $this->contexts->build($user, $conversation, $content, $documentIds);
        $systemContext = $prompt->instructions()."\n\nUNTRUSTED_CONTEXT_JSON:\n".json_encode(
            $context,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
        );
        $request = new AIRequest(
            $systemContext,
            $content,
            $conversation->language,
            $prompt->key(),
            $prompt->version(),
            ['conversation_id' => $conversation->id],
        );
        $correlationId = (string) Str::uuid();
        $providerName = (string) $this->settings->all()['provider'];

        // The user message remains as a truthful audit of the attempt; no assistant message is created on failure.
        $conversation->messages()->create(['role' => 'user', 'content' => $content]);
        $startedAt = hrtime(true);

        try {
            $response = $this->provider->generateStructured($request, ['summary' => 'string', 'next_actions' => 'array']);
            if (!isset($response->data['summary'], $response->data['next_actions'])
                || !is_string($response->data['summary'])
                || !is_array($response->data['next_actions'])
                || collect($response->data['next_actions'])->contains(fn ($action) => !is_string($action))) {
                throw new RuntimeException('Invalid structured response');
            }

            $assistant = $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $response->data['summary'],
                'structured_data' => $response->data,
                'input_tokens' => $response->inputTokens,
                'output_tokens' => $response->outputTokens,
            ]);
            $this->usage->record($user, $conversation, 'success', $correlationId, $prompt->key(), $prompt->version(), $response->inputTokens, $response->outputTokens, $response->durationMs);

            Log::info('Coach provider call completed.', $this->logContext($user, $conversation, $providerName, $correlationId, $response->durationMs, 'success'));

            return $assistant;
        } catch (Throwable $exception) {
            $duration = (int) ((hrtime(true) - $startedAt) / 1_000_000);
            $this->usage->record($user, $conversation, 'failed', $correlationId, $prompt->key(), $prompt->version(), duration: $duration);
            Log::warning('Coach provider call failed.', $this->logContext($user, $conversation, $providerName, $correlationId, $duration, 'failed'));

            throw new RuntimeException('Le Coach est temporairement indisponible.', 0, $exception);
        }
    }

    public function generateStructuredOperation(
        User $user,
        CoachConversation $conversation,
        object $prompt,
        array $context,
        array $schema,
        string $operation,
    ): StructuredAIResponse {
        abort_unless($this->settings->enabled(), 403);
        abort_unless($conversation->user_id === $user->id, 404);
        abort_unless($this->settings->moduleEnabled($conversation->module), 403);
        $this->usage->ensureWithinQuota($user);
        $correlationId = (string) Str::uuid();
        $providerName = (string) $this->settings->all()['provider'];
        $request = new AIRequest(
            $prompt->instructions()."\n\nUNTRUSTED_CONTEXT_JSON:\n".json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            (string) ($context['current_user_message'] ?? ''),
            $conversation->language,
            $prompt->key(),
            $prompt->version(),
            ['conversation_id' => $conversation->id, 'operation' => $operation],
        );
        $startedAt = hrtime(true);

        try {
            $response = $this->provider->generateStructured($request, $schema);
            foreach ($schema as $key => $type) {
                if (!array_key_exists($key, $response->data) || get_debug_type($response->data[$key]) !== $type) {
                    throw new RuntimeException('Invalid structured response');
                }
            }
            $this->usage->record($user, $conversation, 'success', $correlationId, $prompt->key(), $prompt->version(), $response->inputTokens, $response->outputTokens, $response->durationMs, $operation);
            Log::info('Coach provider call completed.', $this->logContext($user, $conversation, $providerName, $correlationId, $response->durationMs, 'success'));

            return $response;
        } catch (Throwable $exception) {
            $duration = (int) ((hrtime(true) - $startedAt) / 1_000_000);
            $this->usage->record($user, $conversation, 'failed', $correlationId, $prompt->key(), $prompt->version(), duration: $duration, operation: $operation);
            Log::warning('Coach provider call failed.', $this->logContext($user, $conversation, $providerName, $correlationId, $duration, 'failed'));
            throw new RuntimeException('Le Coach est temporairement indisponible.', 0, $exception);
        }
    }

    private function logContext(User $user, CoachConversation $conversation, string $provider, string $correlationId, int $duration, string $status): array
    {
        return [
            'operation' => 'coach_message',
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
            'module' => $conversation->module,
            'provider' => $provider,
            'correlation_id' => $correlationId,
            'duration_ms' => $duration,
            'status' => $status,
        ];
    }
}
