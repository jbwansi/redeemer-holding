<?php

namespace App\Mail;

use App\Models\ChatbotLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ChatbotLeadConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ChatbotLead $lead) {}

    public function build()
    {
        return $this->subject('Merci pour votre message')
            ->html("
                <h2>Merci pour votre message</h2>

                <p>Bonjour " . e($this->lead->name ?: '') . ",</p>

                <p>
                    Nous avons bien reçu votre demande via l’assistant du site.
                    Notre équipe reviendra vers vous rapidement.
                </p>

                <p>
                    <strong>Email enregistré :</strong> " . e($this->lead->email) . "
                </p>

                <hr>

                <p style='font-size:12px;color:#777;'>
                    Cet email confirme uniquement la réception de votre demande.
                </p>
            ");
    }
}