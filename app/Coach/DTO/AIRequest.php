<?php

namespace App\Coach\DTO;

readonly class AIRequest
{
    public function __construct(
        public string $systemContext,
        public string $userInput,
        public string $language,
        public string $promptKey,
        public string $promptVersion,
        public array $metadata = [],
    ) {}
}
