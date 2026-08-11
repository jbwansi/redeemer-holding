<?php

namespace App\Coach\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class CoachSettingsService
{
    public const DEFAULTS = [
        'enabled' => true,
        'module_interview' => false,
        'module_cv' => false,
        'module_career' => false,
        'module_certification' => false,
        'provider' => 'fake',
        'languages' => ['fr', 'de', 'en'],
        'default_language' => 'fr',
        'monthly_message_limit' => 100,
        'rate_limit_per_minute' => 10,
        'general_instructions' => '',
        'interview_question_limit' => 5,
    ];

    public function all(): array
    {
        return Cache::remember('coach_settings', 3600, function (): array {
            $stored = Setting::query()
                ->whereIn('type', array_map(fn (string $key) => 'coach_'.$key, array_keys(self::DEFAULTS)))
                ->pluck('value', 'type');

            $settings = self::DEFAULTS;
            foreach ($settings as $key => $default) {
                $value = $stored->get('coach_'.$key);
                if ($value === null) {
                    continue;
                }
                $settings[$key] = match (true) {
                    is_bool($default) => filter_var($value, FILTER_VALIDATE_BOOL),
                    is_int($default) => (int) $value,
                    is_array($default) => json_decode($value, true) ?: $default,
                    default => $value,
                };
            }

            return $settings;
        });
    }

    public function enabled(): bool
    {
        return $this->all()['enabled'];
    }

    public function moduleEnabled(string $module): bool
    {
        return match ($module) {
            'general' => true,
            'interview' => $this->all()['module_interview'],
            'cv' => $this->all()['module_cv'],
            'career' => $this->all()['module_career'],
            'certification' => $this->all()['module_certification'],
            default => false,
        };
    }

    public function update(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(
                ['type' => 'coach_'.$key],
                ['value' => is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (is_bool($value) ? ($value ? '1' : '0') : (string) $value)],
            );
        }
        Cache::forget('coach_settings');
    }
}
