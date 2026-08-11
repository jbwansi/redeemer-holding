<?php

namespace Tests\Unit\Coach;

use App\Coach\AI\FakeAIProvider;
use App\Coach\DTO\AIRequest;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class FakeAIProviderTest extends TestCase
{
    public function test_fake_provider_supports_text_and_structured_contracts(): void
    {
        $provider = new FakeAIProvider();
        $request = new AIRequest('system', 'message', 'fr', 'general', '1', []);

        $text = $provider->generateText($request);
        $structured = $provider->generateStructured($request, []);

        $this->assertStringContainsString('[fr]', $text->content);
        $this->assertSame(20, $text->inputTokens);
        $this->assertSame(8, $text->outputTokens);
        $this->assertStringStartsWith('fake-', $text->providerRequestId);
        $this->assertGreaterThan(0, $text->durationMs);
        $this->assertArrayHasKey('summary', $structured->data);
        $this->assertArrayHasKey('next_actions', $structured->data);
        $this->assertStringStartsWith('fake-', $structured->providerRequestId);
    }

    public function test_fake_provider_can_simulate_a_timeout(): void
    {
        $this->expectException(RuntimeException::class);
        (new FakeAIProvider('timeout'))->generateText(new AIRequest('system', 'message', 'fr', 'general', '1', []));
    }

    public function test_fake_provider_can_return_an_invalid_structured_contract(): void
    {
        $response = (new FakeAIProvider('invalid'))->generateStructured(
            new AIRequest('system', 'message', 'en', 'general', '1', []),
            ['summary' => 'string', 'next_actions' => 'array'],
        );

        $this->assertSame(['unexpected' => true], $response->data);
    }

    public function test_fake_provider_supports_all_interview_contracts_without_network(): void
    {
        $provider = new FakeAIProvider();
        $contracts = [
            'interview.analyze_job' => ['role_summary', 'key_responsibilities', 'required_skills'],
            'interview.generate_questions' => ['questions', 'candidate_questions'],
            'interview.evaluate_answer' => ['feedback', 'strength', 'improvement', 'score'],
            'interview.debrief' => ['overall_summary', 'strengths', 'improvements', 'recommended_actions'],
        ];
        foreach ($contracts as $key => $expectedKeys) {
            $response = $provider->generateStructured(new AIRequest('system', 'answer', 'de', $key, '1.0'), []);
            foreach ($expectedKeys as $expectedKey) { $this->assertArrayHasKey($expectedKey, $response->data); }
            $this->assertStringStartsWith('fake-', $response->providerRequestId);
            $this->assertGreaterThan(0, $response->inputTokens + $response->outputTokens);
        }
    }
}
