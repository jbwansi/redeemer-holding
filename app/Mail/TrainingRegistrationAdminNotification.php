<?php

namespace App\Mail;

use App\Models\Training;
use App\Models\TrainingParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TrainingRegistrationAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $training;
    public $participant;

    public function __construct(Training $training, TrainingParticipant $participant)
    {
        $this->training = $training;
        $this->participant = $participant;
    }

    public function build()
    {
        return $this->subject('Nouvelle inscription à la formation - ' . $this->training->title)
            ->view('emails.formation-registration-admin')
            ->with([
                'training' => $this->training,
                'participant' => $this->participant
            ]);
    }
}


