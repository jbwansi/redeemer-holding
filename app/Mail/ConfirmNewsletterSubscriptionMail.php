<?php

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ConfirmNewsletterSubscriptionMail extends Mailable
{
    use Queueable, SerializesModels;

    public NewsletterSubscriber $subscriber;

    public function __construct(NewsletterSubscriber $subscriber)
    {
        $this->subscriber = $subscriber;
    }

    public function build()
    {
        $confirmUrl = route('newsletter.confirm', [
            'token' => $this->subscriber->confirmation_token,
        ]);

        return $this
            // ✅ récupère depuis .env (Infomaniak)
            ->from(
                config('mail.from.address'),
                config('mail.from.name')
            )

            // ✅ subject fixe (bon choix)
            ->subject('Confirmez votre abonnement à la newsletter')

            // ✅ vue Blade
            ->view('emails.newsletter.confirm', [

                // données principales
                'confirmUrl' => $confirmUrl,
                'email' => $this->subscriber->email,

                // 🔥 configurables via DB
                'buttonText' => Setting::getValue(
                    'newsletter_button_text',
                    'Confirmer mon abonnement'
                ),

                'brandName' => Setting::getValue(
                    'newsletter_brand_name',
                    config('app.name')
                ),

                'supportEmail' => Setting::getValue(
                    'newsletter_support_email',
                    config('mail.from.address')
                ),

                'primaryColor' => Setting::getValue(
                    'newsletter_primary_color',
                    '#ef3b2d'
                ),
            ]);
    }
}
