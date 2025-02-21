<?php

namespace App\Notifications;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;


class InvoiceNotification extends Notification
{
    // use Queueable;

    protected $event;
    protected $registration;
    protected $invoice;

    public function __construct($event, $registration, $invoiceData)
    {
        $this->event = $event;
        $this->registration = $registration;
        $this->invoice = $invoiceData;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Générer le PDF
        $pdf = Pdf::loadView('pdf.event', $this->invoice);

        return (new MailMessage)
            ->subject('Votre facture pour ' . $this->event->title)
            ->greeting('Bonjour ' . $this->registration->name)
            ->line('Nous vous remercions pour votre inscription à l\'événement ' . $this->event->title . '.')
            ->line('Vous trouverez ci-joint votre facture.')
            ->line('Détails de votre réservation:')
            ->line('- Nombre de places: ' . $this->registration->qty)
            ->line('- Référence: ' . $this->registration->reference)
            ->line('- Date de l\'événement: ' . $this->event->start_date->format('d/m/Y H:i'))
            ->action('Voir les détails de l\'événement', route('evenements.details', $this->event->slug))
            ->line('Merci de votre confiance!')
            ->attachData($pdf->output(), 'facture_' . $this->registration->reference . '.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
