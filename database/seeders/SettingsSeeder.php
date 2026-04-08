<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['type' => 'site_name',        'value' => 'Redeemer Holding'],
            ['type' => 'site_description', 'value' => 'Coaching, transformation personnelle et développement professionnel.'],
            ['type' => 'site_email',       'value' => 'contact@redeemer.com'],
            ['type' => 'site_phone',       'value' => '+1 514 000 0000'],
            ['type' => 'site_address',     'value' => 'Montréal, Québec, Canada'],
            ['type' => 'facebook_url',     'value' => 'https://facebook.com/redeemer'],
            ['type' => 'instagram_url',    'value' => 'https://instagram.com/redeemer'],
            ['type' => 'linkedin_url',     'value' => 'https://linkedin.com/company/redeemer'],
            ['type' => 'youtube_url',      'value' => ''],
            ['type' => 'twitter_url',      'value' => ''],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['type' => $setting['type']], ['value' => $setting['value']]);
        }
    }
}
