<?php

namespace App\Coach\DTO;

readonly class AIResponse
{
    public function __construct(public string $content, public int $inputTokens, public int $outputTokens, public string $providerRequestId, public int $durationMs) {}
}
