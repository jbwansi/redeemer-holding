<?php

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\QueryException;

if (!function_exists('get_setting')) {
    function get_setting($key, $default = null, $lang = false)
    {
        try {
            $settings = Cache::remember('business_settings', 300, function () {
                return Setting::all();
            });
        } catch (QueryException $e) {
            return $default;
        }

        if ($lang == false) {
            $setting = $settings->where('type', $key)->first();
        } else {
            $setting = $settings->where('type', $key)->where('lang', $lang)->first();
            $setting = !$setting ? $settings->where('type', $key)->first() : $setting;
        }
        return $setting == null ? $default : $setting->value;
    }
}
