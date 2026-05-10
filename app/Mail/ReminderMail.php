<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $type,
        public mixed $participant,
        public int $daysBefore = 1,
        public ?string $meetingLink = null,
    ) {}

    public function build()
    {
        $item = $this->participant->{$this->type};

        $defaultSubject = $this->daysBefore <= 1
            ? "Rappel : votre {$this->type} commence demain"
            : "Rappel : votre {$this->type} commence dans {$this->daysBefore} jours";

        return $this
            ->subject(
                get_setting("{$this->type}_reminder_subject", $defaultSubject)
            )
            ->view('emails.reminder')
            ->with([
                'type' => $this->type,
                'label' => $this->type === 'event' ? 'événement' : 'formation',
                'participant' => $this->participant,
                'item' => $item,
                'daysBefore' => $this->daysBefore,
                'meetingLink' => $this->meetingLink,
                'customMessage' => get_setting("{$this->type}_reminder_message"),
            ]);
    }
}