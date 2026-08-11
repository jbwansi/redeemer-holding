<?php

namespace App\Http\Controllers\Admin;

use App\Coach\Services\CoachSettingsService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCoachSettingsRequest;
use App\Models\CoachUsage;

class CoachController extends Controller
{
    public function index(CoachSettingsService $settings)
    {
        return inertia('backend/coach/index', [
            'settings' => $settings->all(),
            'metrics' => [
                'requests' => CoachUsage::count(),
                'successfulRequests' => CoachUsage::where('status', 'success')->count(),
                'failedRequests' => CoachUsage::where('status', 'failed')->count(),
                'inputTokens' => (int) CoachUsage::sum('input_tokens'),
                'outputTokens' => (int) CoachUsage::sum('output_tokens'),
                'activeUsers' => CoachUsage::distinct('user_id')->count('user_id'),
            ],
        ]);
    }

    public function update(UpdateCoachSettingsRequest $request, CoachSettingsService $settings)
    {
        $settings->update($request->validated());

        return back()->with('success', 'Configuration du Coach mise à jour.');
    }
}
