<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $subject,
        public string $headline,
        public string $content,
        public ?string $ctaText = null,
        public ?string $ctaUrl = null,
        public ?string $unsubscribeUrl = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter-campaign',
            with: [
                'headline' => $this->headline,
                'contentText' => $this->content,
                'ctaText' => $this->ctaText,
                'ctaUrl' => $this->ctaUrl,
                'unsubscribeUrl' => $this->unsubscribeUrl,
                'appName' => config('app.name'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
