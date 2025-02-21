<?php

namespace App\Notifications;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FormationInvoiceNotification extends Notification
{
    // use Queueable;
    protected $formation;
    protected $registration;
    protected $invoice;

    public function __construct($formation, $registration, $invoiceData)
    {
        $this->formation = $formation;
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
            ->subject('Votre facture pour la formation : ' . $this->formation->title)
            ->greeting('Bonjour ' . $this->registration->name)
            ->line('Nous vous remercions pour votre inscription à la formation : ' . $this->formation->title . '.')
            ->line('Vous trouverez ci-joint votre facture.')
            ->line('Détails de votre inscription :')
            ->line('- Nombre de places : ' . $this->registration->qty)
            ->line('- Référence : ' . $this->registration->reference)
            ->line('- Dates de la formation : du ' . $this->formation->start_date->format('d/m/Y') . ' au ' . $this->formation->end_date->format('d/m/Y'))
            ->line('- Horaires : de ' . $this->formation->start_date->format('H:i') . ' à ' . $this->formation->end_date->format('H:i'))
            ->line('- Lieu : ' . $this->formation->location)
            ->action('Voir les détails de la formation', route('formations.details', $this->formation->slug))
            ->line('Nous nous réjouissons de vous accueillir pour cette formation !')
            ->attachData($pdf->output(), 'facture_formation_' . $this->registration->reference . '.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
