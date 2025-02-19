<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'app_settings';
    private const CACHE_TTL = 3600; // 1 heure

    public function getAllSettings()
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Setting::all()->mapWithKeys(function ($setting) {
                $value = $setting->value;
                return [$setting->type => is_string($value) && $this->isJson($value) ?
                    json_decode($value, true) : $value];
            })->toArray();
        });
    }

    public function getSetting(string $key)
    {
        $settings = $this->getAllSettings();
        return $settings[$key] ?? null;
    }

    public function updateSettings(array $settings)
    {
        foreach ($settings as $key => $value) {
            $setting = Setting::firstOrNew(['type' => $key]);
            $setting->value = is_array($value) ? json_encode($value) : $value;
            $setting->save();
        }

        Cache::forget(self::CACHE_KEY);
    }

    private function isJson($string) {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }
}
