<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $type,
        public mixed $item,
        public mixed $participant,
    ) {}

    public function build()
    {
        return $this
            ->subject($this->getSubject())
            ->view('emails.registration-admin-notification')
            ->with([
                'type' => $this->type,
                'item' => $this->item,
                'participant' => $this->participant,
            ]);
    }

    private function getSubject(): string
    {
        return match ($this->type) {

            'formation'
                => 'Nouvelle inscription à la formation - ' . $this->item->title,

            'event'
                => 'Nouvelle inscription à l’événement - ' . $this->item->title,

            'service'
                => 'Nouvelle demande de service - ' . $this->item->title,

            default
                => 'Nouvelle inscription',
        };
    }
}