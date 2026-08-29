<?php

namespace App\Jobs;

use App\Mail\NewsletterCampaignMail;
use App\Models\NewsletterCampaign;
use App\Services\DynamicMailerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Throwable;

class SendNewsletterChunk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public bool $failOnTimeout = true;

    public function backoff(): array
    {
        return [30, 120];
    }

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping($this->chunkKey()))
                ->releaseAfter(30)
                ->expireAfter($this->timeout + 30),
        ];
    }

    public function __construct(
        public int $campaignId,
        public array $emails,
    ) {
    }

    public function handle(DynamicMailerService $dynamicMailerService): void
    {
        $campaign = NewsletterCampaign::query()->find($this->campaignId);

        if (!$campaign || $campaign->status === 'completed') {
            return;
        }

        if ($campaign->started_at === null) {
            $campaign->forceFill([
                'status' => 'sending',
                'started_at' => now(),
            ])->save();
        }

        $sent = 0;
        $failed = 0;

        foreach ($this->emails as $email) {
            $resultKey = $this->recipientResultKey($email);
            if (Cache::has($resultKey)) {
                continue;
            }

            try {
                $unsubscribeUrl = URL::temporarySignedRoute(
                    'newsletters.unsubscribe',
                    Carbon::now()->addYears(5),
                    ['email' => $email]
                );

                $dynamicMailerService->send(
                    new NewsletterCampaignMail(
                        subject: $campaign->subject,
                        headline: $campaign->headline,
                        content: $campaign->content,
                        ctaText: $campaign->cta_text,
                        ctaUrl: $campaign->cta_url,
                        unsubscribeUrl: $unsubscribeUrl,
                    ),
                    $email
                );

                if (Cache::add($resultKey, 'sent', now()->addYear())) {
                    $sent++;
                }
            } catch (\Throwable $exception) {
                report($exception);
                if (Cache::add($resultKey, 'failed', now()->addYear())) {
                    $failed++;
                }
            }
        }

        $campaignModel = NewsletterCampaign::query()->find($campaign->id);
        if ($campaignModel) {
            $campaignModel->increment('sent_count', $sent);
            $campaignModel->increment('failed_count', $failed);
        }

        $fresh = NewsletterCampaign::query()->find($campaign->id);
        if (!$fresh) {
            return;
        }

        if (($fresh->sent_count + $fresh->failed_count) >= $fresh->total_recipients) {
            $fresh->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
            ])->save();
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::channel('newsletter')->error('Newsletter chunk définitivement échoué.', [
            'operation' => 'newsletter_chunk_send',
            'resource_type' => NewsletterCampaign::class,
            'resource_id' => $this->campaignId,
            'job' => self::class,
            'attempt' => $this->attempts(),
            'chunk_id' => $this->chunkKey(),
            'error_type' => $exception::class,
        ]);
    }

    private function chunkKey(): string
    {
        $recipients = array_map(static fn (string $email): string => strtolower(trim($email)), $this->emails);
        sort($recipients);

        return 'newsletter:' . $this->campaignId . ':chunk:' . hash('sha256', implode('|', $recipients));
    }

    private function recipientResultKey(string $email): string
    {
        return 'newsletter:' . $this->campaignId . ':recipient:' . hash('sha256', strtolower(trim($email)));
    }
}
