<?php

namespace App\Mail;

use App\Models\Formation;
use App\Models\FormationParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FormationRegistrationConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $formation;
    public $participant;
    public $customMessage;

    public function __construct(Formation $formation, FormationParticipant $participant)
    {
        $this->formation = $formation;
        $this->participant = $participant;
        $this->customMessage = get_setting('formation_confirmation_message');
    }

    public function build()
    {
        $subject = get_setting('formation_confirmation_subject', 'Confirmation de votre inscription - ' . $this->formation->title);

        return $this->subject($subject)
            ->view('emails.formation-registration-confirmation')
            ->with([
                'formation' => $this->formation,
                'participant' => $this->participant,
                'hasMeetingLink' => !empty($this->formation->meeting_link),
                'customMessage' => $this->customMessage,
            ]);
    }
}
