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

class AdminEventNotificationMail extends Mailable
{
    use  SerializesModels;

    public $event;
    public $participant;

    /**
     * Create a new message instance.
     */
    public function __construct(Event $event, EventParticipant $participant)
    {
        $this->event = $event;
        $this->participant = $participant;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎯 Nouvelle inscription - ' . $this->event->title,
            from: config('mail.from.address', 'noreply@redeemerholding.com')
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-event-notification',
            with: [
                'event' => $this->event,
                'participant' => $this->participant,
                'totalParticipants' => $this->event->participants()->where('status', 'completed')->sum('qty'),
                'availableSeats' => $this->event->max_participants ?
                    ($this->event->max_participants - $this->event->participants()->where('status', 'completed')->sum('qty')) :
                    null
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
