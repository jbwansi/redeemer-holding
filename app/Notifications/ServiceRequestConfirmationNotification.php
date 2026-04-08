<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceRequestConfirmationNotification extends Notification
{
    use Queueable;

    private bool $enabled;
    private string $subject;
    private ?string $customMessage;

    public function __construct(private ServiceRequest $serviceRequest)
    {
        $this->enabled = (bool) get_setting('service_confirmation_enabled', true);
        $this->subject = (string) get_setting('service_confirmation_subject', 'Confirmation de votre demande de service');
        $this->customMessage = get_setting('service_confirmation_message');
    }

    public function via($notifiable): array
    {
        return $this->enabled ? ['mail'] : [];
    }

    public function toMail($notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting("Bonjour {$this->serviceRequest->first_name}!");

        if (!empty($this->customMessage)) {
            $mail->line($this->customMessage);
        } else {
            $mail->line('Nous avons bien reçu votre demande de service.');
        }

        return $mail
            ->line('Service demandé: ' . $this->serviceRequest->service->name)
            ->line('Nous traiterons votre demande dans les plus brefs délais.')
            ->line('Un de nos conseillers vous contactera prochainement.')
            ->line('Merci de votre confiance!');
    }
}
