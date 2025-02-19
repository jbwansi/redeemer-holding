<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewServiceRequestNotification extends Notification
{
    use Queueable;

    public function __construct(private ServiceRequest $serviceRequest) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle demande de service')
            ->greeting('Bonjour!')
            ->line('Une nouvelle demande de service a été reçue.')
            ->line('Client: ' . $this->serviceRequest->first_name . ' ' . $this->serviceRequest->last_name)
            ->line('Service: ' . $this->serviceRequest->service->name)
            ->action('Voir la demande', route('service-requests.show', $this->serviceRequest->id))
            ->line('Merci de traiter cette demande rapidement.');
    }

    public function toArray($notifiable): array
    {
        return [
            'service_request_id' => $this->serviceRequest->id,
            'message' => "Nouvelle demande de {$this->serviceRequest->first_name} {$this->serviceRequest->last_name}",
        ];
    }
}
