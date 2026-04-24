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
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class SendNewsletterChunk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public int $campaignId,
        public array $emails,
        protected DynamicMailerService $dynamicMailerService,
    ) {
    }

    public function handle(): void
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
            try {
                $unsubscribeUrl = URL::temporarySignedRoute(
                    'newsletters.unsubscribe',
                    Carbon::now()->addYears(5),
                    ['email' => $email]
                );

                $this->dynamicMailerService->send(
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

                $sent++;
            } catch (\Throwable $exception) {
                report($exception);
                $failed++;
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
}
