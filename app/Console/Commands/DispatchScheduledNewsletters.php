<?php

namespace App\Console\Commands;

use App\Jobs\SendNewsletterChunk;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterUnsubscribe;
use Illuminate\Console\Command;

class DispatchScheduledNewsletters extends Command
{
    protected $signature = 'newsletters:dispatch-scheduled';
    protected $description = 'Dispatch scheduled newsletter campaigns';

    public function handle(): int
    {
        $campaigns = NewsletterCampaign::query()
            ->where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($campaigns as $campaign) {
            $recipients = $this->resolveRecipientsForCampaign($campaign);

            if ($recipients->isEmpty()) {
                $campaign->update([
                    'status' => 'failed',
                    'queued_at' => now(),
                ]);

                continue;
            }

            $campaign->update([
                'status' => 'queued',
                'queued_at' => now(),
            ]);

            foreach ($recipients->chunk(100) as $chunk) {
                SendNewsletterChunk::dispatch($campaign->id, $chunk->values()->all());
            }
        }

        return self::SUCCESS;
    }

    private function resolveRecipientsForCampaign(NewsletterCampaign $campaign)
    {
        $emails = collect();

        foreach ($campaign->segments ?? [] as $segment) {
            if ($segment === 'newsletter_subscribers') {
                $emails = $emails->merge(
                    \App\Models\NewsletterSubscriber::query()
                        ->whereNotNull('email')
                        ->whereNotNull('confirmed_at')
                        ->pluck('email')
                );
                continue;
            }

            if ($segment === 'users') {
                $emails = $emails->merge(
                    \App\Models\User::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );
                continue;
            }

            if ($segment === 'event_participants') {
                $emails = $emails->merge(
                    \App\Models\EventParticipant::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );
                continue;
            }

            if ($segment === 'formation_participants') {
                $emails = $emails->merge(
                    \App\Models\FormationParticipant::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );
                continue;
            }

            if ($segment === 'service_requests') {
                $emails = $emails->merge(
                    \App\Models\ServiceRequest::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );
                continue;
            }
        }

        $unsubscribedEmails = NewsletterUnsubscribe::query()->pluck('email');

        return $emails
            ->map(fn ($email) => strtolower(trim((string) $email)))
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->diff($unsubscribedEmails)
            ->values();
    }
}