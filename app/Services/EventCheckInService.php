<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class EventCheckInService
{
    public function __construct(private readonly EventTicketService $tickets) {}

    /** @return array{result: string, participant: EventParticipant} */
    public function checkIn(Event $event, string $ticketUrl, User $operator): array
    {
        $ticketRequest = Request::create($ticketUrl, 'GET');

        if (! URL::hasValidSignature($ticketRequest)) {
            throw ValidationException::withMessages(['ticket' => 'Ce QR code est invalide ou a été falsifié.']);
        }

        $reference = $this->referenceFromPath($ticketRequest->path());

        return DB::transaction(function () use ($event, $reference, $operator): array {
            $participant = EventParticipant::query()
                ->where('reference', $reference)
                ->lockForUpdate()
                ->first();

            if (! $participant || (int) $participant->event_id !== (int) $event->id) {
                throw ValidationException::withMessages(['ticket' => 'Ce billet ne correspond pas à cet événement.']);
            }

            $state = $this->tickets->state($event, $participant);
            if ($state !== 'valid') {
                $message = match ($state) {
                    'cancelled' => 'Ce billet a été annulé.',
                    'expired' => 'Ce billet a expiré.',
                    default => 'Cette inscription ne donne pas accès à l’événement.',
                };

                throw ValidationException::withMessages(['ticket' => $message]);
            }

            if ($participant->checked_in_at) {
                return ['result' => 'already_checked_in', 'participant' => $participant];
            }

            $participant->forceFill([
                'checked_in_at' => now(),
                'checked_in_by' => $operator->id,
            ])->save();

            return ['result' => 'checked_in', 'participant' => $participant->refresh()];
        });
    }

    private function referenceFromPath(string $path): string
    {
        if (! preg_match('#(?:^|/)billets/evenements/([^/]+)$#', $path, $matches)) {
            throw ValidationException::withMessages(['ticket' => 'Ce QR code n’est pas un billet événement.']);
        }

        return rawurldecode($matches[1]);
    }
}
