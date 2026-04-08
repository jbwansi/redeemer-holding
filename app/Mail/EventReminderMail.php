<?php

namespace App\Mail;

use App\Models\EventParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $participant;
    public $daysBefore;
    public $zoomLink;
    public $customMessage;

    public function __construct(EventParticipant $participant, int $daysBefore = 1, ?string $zoomLink = null)
    {
        $this->participant = $participant;
        $this->daysBefore = $daysBefore;
        $this->zoomLink = $zoomLink;
        $this->customMessage = get_setting('event_reminder_message');
    }

    public function build()
    {
        $defaultSubject = $this->daysBefore <= 1
            ? 'Rappel : Votre événement commence demain'
            : 'Rappel : Votre événement commence dans ' . $this->daysBefore . ' jours';

        $subject = get_setting('event_reminder_subject', $defaultSubject);

        return $this->subject($subject)
            ->view('emails.event-reminder')
            ->with([
                'daysBefore' => $this->daysBefore,
                'zoomLink' => $this->zoomLink,
                'customMessage' => $this->customMessage,
            ]);
    }
}
