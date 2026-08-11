<?php

namespace Tests\Unit\Coach;

use App\Coach\Prompts\PromptRegistry;
use PHPUnit\Framework\TestCase;

class CvPromptsTest extends TestCase
{
    public function test_cv_prompts_are_versioned_registered_and_forbid_fact_invention(): void
    {
        $registry = new PromptRegistry();
        foreach (['cv.compare', 'cv.improve', 'cv.adapt', 'cv.cover_letter', 'cv.application_message'] as $key) {
            $prompt = $registry->forKey($key);
            $this->assertSame($key, $prompt->key());
            $this->assertSame('1.0', $prompt->version());
            $this->assertMatchesRegularExpression('/n.invente|invente jamais/iu', $prompt->instructions());
        }
    }
}
