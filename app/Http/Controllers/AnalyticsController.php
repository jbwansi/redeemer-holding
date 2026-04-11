<?php

namespace App\Http\Controllers;

use App\Services\GoogleAnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function visitorsByCountry(GoogleAnalyticsService $ga): JsonResponse
    {
        try {
            return response()->json($ga->getVisitorsByCountry());
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
