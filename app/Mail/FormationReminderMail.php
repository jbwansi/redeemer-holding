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

    public function __construct(FormationParticipant $participant)
    {
        $this->participant = $participant;
    }

    public function build()
    {
        return $this->subject('Rappel : Votre formation commence demain')
            ->view('emails.formation-reminder');
    }
}
