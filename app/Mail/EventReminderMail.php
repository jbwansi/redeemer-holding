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

    public function __construct(EventParticipant $participant)
    {
        $this->participant = $participant;
    }

    public function build()
    {
        return $this->subject('Rappel : Votre événement commence demain')
            ->view('emails.event-reminder');
    }
}
