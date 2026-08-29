<?php

namespace App\Console\Commands;

use App\Jobs\SendNewsletterChunk;
use App\Models\NewsletterCampaign;
use App\Services\NewsletterAudienceResolver;
use Illuminate\Console\Command;

class DispatchScheduledNewsletters extends Command
{
    protected $signature = 'newsletters:dispatch-scheduled';
    protected $description = 'Dispatch scheduled newsletter campaigns';

    public function handle(NewsletterAudienceResolver $audienceResolver): int
    {
        $campaigns = NewsletterCampaign::query()
            ->where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($campaigns as $campaign) {
            $claimed = NewsletterCampaign::query()
                ->whereKey($campaign->id)
                ->where('status', 'scheduled')
                ->where('scheduled_at', '<=', now())
                ->update(['status' => 'queued', 'queued_at' => now()]);

            if ($claimed !== 1) {
                continue;
            }

            $recipients = $audienceResolver->resolve(
                $campaign->segments ?? [],
                $campaign->custom_emails ?? [],
            );

            if ($recipients->isEmpty()) {
                $campaign->update([
                    'status' => 'failed',
                    'total_recipients' => 0,
                ]);

                continue;
            }

            $campaign->update(['total_recipients' => $recipients->count()]);

            foreach ($recipients->chunk(100) as $chunk) {
                SendNewsletterChunk::dispatch($campaign->id, $chunk->values()->all());
            }
        }

        return self::SUCCESS;
    }

}
