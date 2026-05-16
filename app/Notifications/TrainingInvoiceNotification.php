<?php

namespace App\Notifications;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrainingInvoiceNotification extends Notification
{
    // use Queueable;
    protected $training;
    protected $registration;
    protected $invoice;

    public function __construct($training, $registration, $invoiceData)
    {
        $this->training = $training;
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
        $pdf = Pdf::loadView('pdf.formation', $this->invoice);

        return (new MailMessage)
            ->subject('Votre facture pour la formation : ' . $this->training->title)
            ->greeting('Bonjour ' . $this->registration->name)
            ->line('Nous vous remercions pour votre inscription à la formation : ' . $this->training->title . '.')
            ->line('Vous trouverez ci-joint votre facture.')
            ->line('Détails de votre inscription :')
            ->line('- Nombre de places : ' . $this->registration->qty)
            ->line('- Référence : ' . $this->registration->reference)
            ->line('- Dates de la formation : du ' . $this->training->start_date->format('d/m/Y') . ' au ' . $this->training->end_date->format('d/m/Y'))
            ->line('- Horaires : de ' . $this->training->start_date->format('H:i') . ' à ' . $this->training->end_date->format('H:i'))
            ->line('- Lieu : ' . $this->training->location)
            ->action('Voir les détails de la formation', route('formations.details', $this->training->slug))
            ->line('Nous nous réjouissons de vous accueillir pour cette formation !')
            ->attachData($pdf->output(), 'facture_formation_' . $this->registration->reference . '.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
