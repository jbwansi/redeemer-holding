<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventConfirmationMail extends Mailable
{
    use  SerializesModels;

    public $event;
    public $participant;
    public $customMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(Event $event, EventParticipant $participant)
    {
        $this->event = $event;
        $this->participant = $participant;
        $this->customMessage = get_setting('event_confirmation_message');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = get_setting('event_confirmation_subject', 'Confirmation de réservation - ' . $this->event->title);

        return new Envelope(
            subject: $subject,
            from: config('mail.from.address', 'noreply@redeemerholding.com'),
            replyTo: [
                config('mail.support.address', 'support@redeemerholding.com')
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.event-confirmation',
            with: [
                'event' => $this->event,
                'participant' => $this->participant,
                'customMessage' => $this->customMessage,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
