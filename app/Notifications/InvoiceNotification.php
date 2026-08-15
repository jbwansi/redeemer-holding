<?php

namespace App\Notifications;

use App\Services\EventTicketService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceNotification extends Notification
{
    public function __construct(
        protected $event,
        protected $registration,
        protected $invoice
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $pdf = Pdf::loadView('pdf.event', $this->invoice);
        $ticketUrl = app(EventTicketService::class)
            ->signedUrl($this->event, $this->registration);

        return (new MailMessage)
            ->subject('Votre facture pour '.$this->event->title)
            ->greeting('Bonjour '.$this->registration->name)
            ->line('Nous vous remercions pour votre inscription à l’événement '.$this->event->title.'.')
            ->line('Vous trouverez ci-joint votre facture.')
            ->line('Détails de votre réservation :')
            ->line('- Nombre de places : '.$this->registration->qty)
            ->line('- Référence : '.$this->registration->reference)
            ->line('- Date de l’événement : '.$this->event->start_date->format('d/m/Y H:i'))
            ->action(
                $ticketUrl ? 'Afficher mon billet' : 'Voir les détails de l’événement',
                $ticketUrl ?? route('evenements.details', $this->event->slug)
            )
            ->line('Merci de votre confiance !')
            ->attachData($pdf->output(), 'facture_'.$this->registration->reference.'.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
