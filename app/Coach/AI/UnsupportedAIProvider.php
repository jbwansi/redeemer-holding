<?php

namespace App\Coach\AI;

use App\Coach\DTO\AIRequest;
use App\Coach\DTO\AIResponse;
use App\Coach\DTO\StructuredAIResponse;
use RuntimeException;

class UnsupportedAIProvider implements AIProviderInterface
{
    public function __construct(private readonly string $provider) {}

    public function generateText(AIRequest $request): AIResponse
    {
        throw new RuntimeException("Unsupported AI provider: {$this->provider}");
    }

    public function generateStructured(AIRequest $request, array $schema): StructuredAIResponse
    {
        throw new RuntimeException("Unsupported AI provider: {$this->provider}");
    }
}
