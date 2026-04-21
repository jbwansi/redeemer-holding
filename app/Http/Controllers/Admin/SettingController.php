<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TestEmailSender;
use App\Services\DynamicMailerService;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{

    protected $settingsService;
    protected $dynamicMailerService;

    public function __construct(SettingsService $settingsService, DynamicMailerService $dynamicMailerService)
    {
        $this->settingsService = $settingsService;
        $this->dynamicMailerService = $dynamicMailerService;
    }


    public function index()
    {
        return inertia('backend/settings/index');
    }

    public function smtp()
    {
        return inertia('backend/settings/smtp');
    }

    public function pusher()
    {
        return inertia('backend/settings/pusher');
    }

    public function security()
    {
        return inertia('backend/settings/security');
    }

    public function api()
    {
        return inertia('backend/settings/api');
    }

    public function payment()
    {
        return inertia('backend/settings/payment');
    }

    public function socials()
    {
        return inertia('backend/settings/socials');
    }

    public function testUsers()
    {
        return inertia('backend/settings/test-users');
    }

    public function update(Request $request)
    {
        $this->settingsService->updateSettings($request->all());
        return back()->with('success', 'Les paramètres ont été mis à jour avec succès');
    }

    public function fetch()
    {
        return $this->settingsService->getAllSettings();
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

   public function test_send_email(Request $request)
{
    $request->validate([
        'test_email' => ['required', 'email'],
    ]);

    try {
        // 🔥 Log utile
        $settings = $this->settingsService->getAllSettings();
        $host = $settings['host'] ?? null;
        $port = isset($settings['port']) ? (int) $settings['port'] : 587;
        $encryption = $settings['encryption'] ?? null;
        $username = $settings['username'] ?? null;
        $senderEmail = $settings['sender_email'] ?? config('mail.from.address') ?? 'admin@redeemerholding.com';

        Log::channel('newsletter')->info('SMTP TEST CONFIG', [
            'host' => $host,
            'port' => $port,
            'encryption' => $encryption,
            'username' => $username,
            'from' => $senderEmail,
        ]);

        // 🔥 Utilise le service de mail dynamique
        $this->dynamicMailerService->send(new TestEmailSender(), $request->test_email);

    } catch (\Throwable $e) {

        Log::channel('newsletter')->error('SMTP TEST ERROR', [
            'message' => $e->getMessage(),
        ]);

        return back()->with('error', 'Erreur SMTP : ' . $e->getMessage());
    }

    return back()->with('success', 'Email de test envoyé avec succès');
}
}
