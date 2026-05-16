<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $type;
    public mixed $item;
    public mixed $participant;

    public function __construct(string $type, mixed $item, mixed $participant)
    {
        $this->type = $type;
        $this->item = $item;
        $this->participant = $participant;
    }

    public function build()
    {
        return $this->subject($this->resolveSubject())
            ->view('emails.registration-confirmation')
            ->with([
                'type' => $this->type,
                'item' => $this->item,
                'participant' => $this->participant,
            ]);
    }

    private function resolveSubject(): string
    {
        return match ($this->type) {
            'formation' => get_setting('formation_confirmation_subject', 'Confirmation de votre inscription - ' . ($this->item->title ?? 'formation')),
            'event' => get_setting('event_confirmation_subject', 'Confirmation de votre reservation - ' . ($this->item->title ?? 'évenement')),
            'service' => get_setting('service_confirmation_subject', 'Confirmation de votre demande de service - ' . ($this->item->name ?? $this->item->title ?? 'service')),
            default => 'Confirmation d\'inscription',
        };
    }
}
