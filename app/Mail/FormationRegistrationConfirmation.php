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

    public function __construct(Formation $formation, FormationParticipant $participant)
    {
        $this->formation = $formation;
        $this->participant = $participant;
    }

    public function build()
    {
        return $this->subject('Confirmation de votre inscription - ' . $this->formation->title)
            ->view('emails.formation-registration-confirmation')
            ->with([
                'formation' => $this->formation,
                'participant' => $this->participant,
                'hasMeetingLink' => !empty($this->formation->meeting_link)
            ]);
    }
}
