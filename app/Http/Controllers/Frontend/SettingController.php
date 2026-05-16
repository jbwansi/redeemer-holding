<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;

class SettingController extends Controller
{
    protected $settingsService;

    public function __construct(SettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    public function publicFetch()
    {
        $settings = $this->settingsService->getAllSettings();

        $allowedKeys = [
            'app_name',
            'contact_email',
            'company_phone',
            'company_address',
            'calendly_link',
            'enable_registration',
            'show_social_links',
            'facebook_enabled',
            'facebook_url',
            'instagram_enabled',
            'instagram_url',
            'twitter_enabled',
            'twitter_url',
            'linkedin_enabled',
            'linkedin_url',
            'youtube_enabled',
            'youtube_url',
            'tiktok_enabled',
            'tiktok_url',
        ];

        return collect($settings)
            ->only($allowedKeys)
            ->toArray();
    }
}
