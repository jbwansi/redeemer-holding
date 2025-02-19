<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre compte a été réactivé')
            ->greeting('Bonjour ' . $notifiable->name)
            ->line('Nous vous informons que votre compte a été réactivé.')
            ->line('Vous pouvez dès maintenant vous reconnecter à votre espace.')
            ->action('Se connecter', url('/login'))
            ->line('Si vous n\'êtes pas à l\'origine de cette demande, veuillez contacter notre support.');
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Compte réactivé',
            'message' => 'Votre compte a été réactivé avec succès.',
            'type' => 'account_reactivated',
        ];
    }
}
