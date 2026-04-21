<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendMailContact extends Mailable
{
    use Queueable, SerializesModels;

    public string $name;
    public string $email;
    public string $contactSubject;
    public string $messageContent;
    public ?string $ipAddress;
    public string $date;

    public function __construct(
        string $name,
        string $email,
        string $subject,
        string $messageContent,
        ?string $ipAddress = null
    ) {
        $this->name = $name;
        $this->email = $email;
        $this->contactSubject = $subject;
        $this->messageContent = $messageContent;
        $this->ipAddress = $ipAddress ?? request()->ip();
        $this->date = now()->format('d/m/Y H:i');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouveau message de contact - ' . $this->contactSubject,
            replyTo: [
                new Address($this->email, $this->name),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact',
            with: [
                'name' => $this->name,
                'email' => $this->email,
                'subject' => $this->contactSubject,
                'messageContent' => $this->messageContent,
                'ipAddress' => $this->ipAddress,
                'date' => $this->date,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}