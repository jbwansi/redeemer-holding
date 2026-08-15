<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Support\Facades\URL;

class EventTicketService
{
    public function canIssue(Event $event, EventParticipant $participant): bool
    {
        return $participant->status === EventParticipant::STATUS_COMPLETED
            && ((float) $event->price <= 0 || $participant->payment_confirmed);
    }

    public function signedUrl(Event $event, EventParticipant $participant): ?string
    {
        if (! $this->canIssue($event, $participant)) {
            return null;
        }

        return URL::signedRoute('events.tickets.show', [
            'reference' => $participant->reference,
        ]);
    }

    public function state(Event $event, EventParticipant $participant): string
    {
        if ($participant->status === EventParticipant::STATUS_CANCELLED) {
            return 'cancelled';
        }

        if (! $this->canIssue($event, $participant)) {
            return 'invalid';
        }

        if (now()->isAfter($event->end_date)) {
            return 'expired';
        }

        return 'valid';
    }
}
