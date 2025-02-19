<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TestEmailSender;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SettingController extends Controller
{

    protected $settingsService;

    public function __construct(SettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
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

    public function update(Request $request)
    {
        $this->settingsService->updateSettings($request->all());
        return back()->with('success', 'Les paramètres ont été mis à jour avec succès');
    }

    public function fetch()
    {
        return $this->settingsService->getAllSettings();
    }

    public function test_send_email(Request $request)
    {
        try {
            Mail::to($request->test_email)->send(new TestEmailSender());
        } catch (\Exception $e) {
            return back()->with('error', 'Une erreur s\'est produite lors de l\'envoi de l\'email de test');
        }

        return back()->with('success', 'Un email de test a été envoyé avec succès');
    }
}
