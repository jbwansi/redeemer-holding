<?php

namespace App\Http\Controllers\Coach;

use App\Coach\Services\CoachSettingsService;
use App\Http\Controllers\Controller;
use App\Models\CoachUsage;
use Illuminate\Http\Request;

class CoachDashboardController extends Controller
{
    public function __invoke(Request $request, CoachSettingsService $settings)
    {
        $user = $request->user();

        return inertia('Frontend/Coach/Dashboard', [
            'profileComplete' => (bool) $user->professionalProfile?->professional_title,
            'documentCount' => $user->coachDocuments()->count(),
            'conversations' => $user->coachConversations()->latest()->limit(5)->get(['id', 'title', 'language']),
            'monthlyUsage' => CoachUsage::where('user_id', $user->id)->where('created_at', '>=', now()->startOfMonth())->count(),
            'settings' => [
                'languages' => $settings->all()['languages'],
                'defaultLanguage' => $settings->all()['default_language'],
                'monthlyLimit' => $settings->all()['monthly_message_limit'],
                'modules' => [
                    'interview' => $settings->moduleEnabled('interview'),
                    'cv' => $settings->moduleEnabled('cv'),
                    'career' => $settings->moduleEnabled('career'),
                    'certification' => $settings->moduleEnabled('certification'),
                ],
            ],
        ]);
    }
}
