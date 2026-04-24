<?php

namespace App\Mail;

use App\Models\ChatbotLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ChatbotLeadNotification extends Mailable
{
    use Queueable, SerializesModels;

    public ChatbotLead $lead;

    public function __construct(ChatbotLead $lead)
    {
        $this->lead = $lead;
    }

    public function build()
    {
        return $this->subject('🤖 Nouveau lead via chatbot')
            ->html("
                <h2>🤖 Nouveau lead chatbot</h2>

                <p><strong>Email :</strong> {$this->lead->email}</p>
                <p><strong>Nom :</strong> " . ($this->lead->name ?? 'Non renseigné') . "</p>

                <hr>

                <p style='color:gray; font-size:12px;'>
                    Source : chatbot du site<br>
                    Date : " . now()->format('d/m/Y H:i') . "
                </p>
            ");
    }
}