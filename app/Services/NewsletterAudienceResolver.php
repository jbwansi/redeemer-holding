<?php

namespace App\Services;

use App\Models\EventParticipant;
use App\Models\NewsletterSubscriber;
use App\Models\NewsletterUnsubscribe;
use App\Models\ServiceRequest;
use App\Models\TrainingParticipant;
use App\Models\User;
use App\Support\NewsletterSegments;
use Illuminate\Support\Collection;

class NewsletterAudienceResolver
{
    public function resolve(array $segments, array|string|null $customEmails = null): Collection
    {
        $emails = collect();

        foreach (NewsletterSegments::normalize($segments) as $segment) {
            $emails = $emails->merge(match ($segment) {
                NewsletterSegments::SUBSCRIBERS => NewsletterSubscriber::query()
                    ->whereNotNull('email')->whereNotNull('confirmed_at')->pluck('email'),
                NewsletterSegments::USERS => User::query()->whereNotNull('email')->pluck('email'),
                NewsletterSegments::EVENT_PARTICIPANTS => EventParticipant::query()
                    ->whereNotNull('email')->pluck('email'),
                NewsletterSegments::TRAINING_PARTICIPANTS => TrainingParticipant::query()
                    ->whereNotNull('email')->pluck('email'),
                NewsletterSegments::SERVICE_REQUESTS => ServiceRequest::query()
                    ->whereNotNull('email')->pluck('email'),
                NewsletterSegments::CUSTOM => collect($this->normalizeCustomEmails($customEmails)),
                default => collect(),
            });
        }

        $unsubscribed = NewsletterUnsubscribe::query()
            ->pluck('email')
            ->map(fn (mixed $email): string => $this->normalizeEmail($email))
            ->filter()
            ->unique();

        return $emails
            ->map(fn (mixed $email): string => $this->normalizeEmail($email))
            ->filter(fn (string $email): bool => filter_var($email, FILTER_VALIDATE_EMAIL) !== false)
            ->unique()
            ->diff($unsubscribed)
            ->values();
    }

    public function normalizeCustomEmails(array|string|null $emails): array
    {
        $values = is_array($emails)
            ? $emails
            : (preg_split('/[\s,;]+/', (string) $emails) ?: []);

        return collect($values)
            ->map(fn (mixed $email): string => $this->normalizeEmail($email))
            ->filter(fn (string $email): bool => filter_var($email, FILTER_VALIDATE_EMAIL) !== false)
            ->unique()
            ->values()
            ->all();
    }

    private function normalizeEmail(mixed $email): string
    {
        return strtolower(trim((string) $email));
    }
}
