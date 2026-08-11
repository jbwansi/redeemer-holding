<?php
namespace Tests\Unit\Coach;
use App\Coach\Prompts\PromptRegistry;
use PHPUnit\Framework\TestCase;
class InterviewPromptsTest extends TestCase
{
    public function test_interview_prompts_are_versioned_and_registered(): void
    {
        $registry = new PromptRegistry();
        foreach (['interview.analyze_job', 'interview.generate_questions', 'interview.evaluate_answer', 'interview.debrief'] as $key) {
            $prompt = $registry->forKey($key);
            $this->assertSame($key, $prompt->key());
            $this->assertSame('1.0', $prompt->version());
            $this->assertNotSame('', $prompt->instructions());
        }
    }
}
