<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\EventParticipant;
use App\Services\EventTicketService;

class EventTicketController extends Controller
{
    public function show(string $reference, EventTicketService $tickets)
    {
        $participant = EventParticipant::with('event')
            ->where('reference', $reference)
            ->firstOrFail();
        $event = $participant->event;
        abort_unless($event, 404);

        $state = $tickets->state($event, $participant);

        return inertia('Frontend/events/ticket', [
            'event' => [
                'title' => $event->title,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'location' => $event->location,
            ],
            'ticket' => [
                'reference' => $participant->reference,
                'participant_name' => $participant->name,
                'quantity' => $participant->qty,
                'state' => $state,
                'is_valid' => $state === 'valid',
            ],
        ]);
    }
}
