<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventCheckInService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventCheckInController extends Controller
{
    public function show(Event $event)
    {
        return inertia('backend/events/scanner', [
            'event' => [
                'slug' => $event->slug,
                'title' => $event->title,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'location' => $event->location,
                'checked_in_places' => $event->participants()
                    ->whereNotNull('checked_in_at')
                    ->sum('qty'),
                'confirmed_places' => $event->participants()
                    ->where('status', 'completed')
                    ->sum('qty'),
            ],
        ]);
    }

    public function store(Request $request, Event $event, EventCheckInService $checkIns): JsonResponse
    {
        $validated = $request->validate([
            'ticket_url' => ['required', 'url', 'max:2048'],
        ]);

        $result = $checkIns->checkIn($event, $validated['ticket_url'], $request->user());
        $participant = $result['participant'];

        return response()->json([
            'result' => $result['result'],
            'message' => $result['result'] === 'checked_in'
                ? 'Entrée validée.'
                : 'Ce billet a déjà été enregistré.',
            'participant' => [
                'name' => $participant->name,
                'reference' => $participant->reference,
                'quantity' => $participant->qty,
                'checked_in_at' => $participant->checked_in_at?->toIso8601String(),
            ],
        ]);
    }
}
