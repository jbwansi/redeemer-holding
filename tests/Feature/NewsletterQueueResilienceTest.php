<?php

namespace Tests\Feature;

use App\Jobs\SendNewsletterChunk;
use App\Models\NewsletterCampaign;
use App\Services\DynamicMailerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

class NewsletterQueueResilienceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'array']);
        Cache::flush();
    }

    public function test_normal_chunk_updates_the_counter_once(): void
    {
        $campaign = $this->campaign();
        $mailer = Mockery::mock(DynamicMailerService::class);
        $mailer->shouldReceive('send')->once();

        (new SendNewsletterChunk($campaign->id, ['reader@example.com'], $mailer))->handle();

        $this->assertDatabaseHas('newsletter_campaigns', [
            'id' => $campaign->id,
            'sent_count' => 1,
            'failed_count' => 0,
            'status' => 'completed',
        ]);
    }

    public function test_replayed_chunk_does_not_send_or_count_twice(): void
    {
        $campaign = $this->campaign();
        $mailer = Mockery::mock(DynamicMailerService::class);
        $mailer->shouldReceive('send')->once();
        $job = new SendNewsletterChunk($campaign->id, ['reader@example.com'], $mailer);

        $job->handle();
        $job->handle();

        $this->assertSame(1, $campaign->fresh()->sent_count);
        $this->assertSame(0, $campaign->fresh()->failed_count);
    }

    public function test_partial_failure_is_counted_once_when_the_chunk_is_replayed(): void
    {
        $campaign = $this->campaign(totalRecipients: 2);
        $mailer = Mockery::mock(DynamicMailerService::class);
        $calls = 0;
        $mailer->shouldReceive('send')->twice()->andReturnUsing(function () use (&$calls): void {
            $calls++;
            if ($calls === 2) {
                throw new \RuntimeException('Temporary SMTP failure');
            }
        });
        $job = new SendNewsletterChunk(
            $campaign->id,
            ['success@example.com', 'failed@example.com'],
            $mailer,
        );

        $job->handle();
        $job->handle();

        $fresh = $campaign->fresh();
        $this->assertSame(1, $fresh->sent_count);
        $this->assertSame(1, $fresh->failed_count);
        $this->assertSame('completed', $fresh->status);
    }

    private function campaign(int $totalRecipients = 1): NewsletterCampaign
    {
        return NewsletterCampaign::query()->create([
            'subject' => 'Sujet',
            'headline' => 'Titre',
            'content' => 'Contenu',
            'segments' => [],
            'status' => 'queued',
            'total_recipients' => $totalRecipients,
        ]);
    }
}
