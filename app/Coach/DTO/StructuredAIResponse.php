<?php

namespace App\Coach\DTO;

readonly class StructuredAIResponse
{
    public function __construct(public array $data, public int $inputTokens, public int $outputTokens, public string $providerRequestId, public int $durationMs) {}
}
