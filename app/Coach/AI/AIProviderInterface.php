<?php

namespace App\Coach\AI;

use App\Coach\DTO\AIRequest;
use App\Coach\DTO\AIResponse;
use App\Coach\DTO\StructuredAIResponse;

interface AIProviderInterface
{
    public function generateText(AIRequest $request): AIResponse;
    public function generateStructured(AIRequest $request, array $schema): StructuredAIResponse;
}
