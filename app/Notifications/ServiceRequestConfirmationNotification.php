<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceRequestConfirmationNotification extends Notification
{
    use Queueable;

    public function __construct(private ServiceRequest $serviceRequest) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirmation de votre demande de service')
            ->greeting("Bonjour {$this->serviceRequest->first_name}!")
            ->line('Nous avons bien reçu votre demande de service.')
            ->line('Service demandé: ' . $this->serviceRequest->service->name)
            ->line('Nous traiterons votre demande dans les plus brefs délais.')
            ->line('Un de nos conseillers vous contactera prochainement.')
            ->line('Merci de votre confiance!');
    }
}
