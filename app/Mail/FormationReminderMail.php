<?php

namespace App\Mail;

use App\Models\FormationParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FormationReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $participant;
    public $daysBefore;
    public $zoomLink;
    public $customMessage;

    public function __construct(FormationParticipant $participant, int $daysBefore = 1, ?string $zoomLink = null)
    {
        $this->participant = $participant;
        $this->daysBefore = $daysBefore;
        $this->zoomLink = $zoomLink;
        $this->customMessage = get_setting('formation_reminder_message');
    }

    public function build()
    {
        $defaultSubject = $this->daysBefore <= 1
            ? 'Rappel : Votre formation commence demain'
            : 'Rappel : Votre formation commence dans ' . $this->daysBefore . ' jours';

        $subject = get_setting('formation_reminder_subject', $defaultSubject);

        return $this->subject($subject)
            ->view('emails.formation-reminder')
            ->with([
                'daysBefore' => $this->daysBefore,
                'zoomLink' => $this->zoomLink,
                'customMessage' => $this->customMessage,
            ]);
    }
}
