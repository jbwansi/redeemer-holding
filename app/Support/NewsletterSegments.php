<?php

namespace App\Support;

final class NewsletterSegments
{
    public const SUBSCRIBERS = 'newsletter_subscribers';
    public const USERS = 'users';
    public const EVENT_PARTICIPANTS = 'event_participants';
    public const TRAINING_PARTICIPANTS = 'training_participants';
    public const LEGACY_FORMATION_PARTICIPANTS = 'formation_participants';
    public const SERVICE_REQUESTS = 'service_requests';
    public const CUSTOM = 'custom';

    public static function canonical(): array
    {
        return [
            self::SUBSCRIBERS,
            self::USERS,
            self::EVENT_PARTICIPANTS,
            self::TRAINING_PARTICIPANTS,
            self::SERVICE_REQUESTS,
            self::CUSTOM,
        ];
    }

    public static function accepted(): array
    {
        return [...self::canonical(), self::LEGACY_FORMATION_PARTICIPANTS];
    }

    public static function normalize(array $segments): array
    {
        return collect($segments)
            ->map(fn (mixed $segment): string => $segment === self::LEGACY_FORMATION_PARTICIPANTS
                ? self::TRAINING_PARTICIPANTS
                : (string) $segment)
            ->filter(fn (string $segment): bool => in_array($segment, self::canonical(), true))
            ->unique()
            ->values()
            ->all();
    }
}
