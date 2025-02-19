<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class WelcomeNotification extends Notification
{
    use Queueable;

    private $password;

    public function __construct($password)
    {
        $this->password = $password;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $features = [
            [
                'icon' => '🚀',
                'title' => 'Interface Intuitive',
                'description' => 'Une expérience utilisateur fluide et moderne conçue pour optimiser votre productivité.'
            ],
            [
                'icon' => '📊',
                'title' => 'Tableau de Bord Personnalisé',
                'description' => 'Accédez à vos données essentielles et suivez vos performances en temps réel.'
            ],
            [
                'icon' => '🔒',
                'title' => 'Sécurité Renforcée',
                'description' => 'Protection de vos données avec les dernières technologies de cryptage.'
            ],
            [
                'icon' => '🔄',
                'title' => 'Synchronisation en Temps Réel',
                'description' => 'Restez à jour avec une synchronisation automatique sur tous vos appareils.'
            ],
            [
                'icon' => '💡',
                'title' => 'Fonctionnalités Avancées',
                'description' => 'Découvrez nos outils puissants pour optimiser votre travail quotidien.'
            ]
        ];

        $socialLinks = [
            'twitter' => 'https://twitter.com/votreentreprise',
            'linkedin' => 'https://linkedin.com/company/votreentreprise',
            'facebook' => 'https://facebook.com/votreentreprise'
        ];

        $quickStartGuides = [
            [
                'title' => 'Guide de Démarrage Rapide',
                'url' => "#"
            ],
            [
                'title' => 'Centre d\'Aide',
                'url' => "#"
            ],
            [
                'title' => 'Tutoriels Vidéo',
                'url' => "#"
            ]
        ];

        $supportInfo = [
            'email' => 'support@' . parse_url(config('app.url'), PHP_URL_HOST),
            'phone' => '+33 1 23 45 67 89',
            'hours' => '9h-18h (Lun-Ven)',
            'chat_url' => "#"
        ];

        return (new MailMessage)
            ->subject('🎉 Bienvenue dans votre espace ' . config('app.name'))
            ->view('emails.welcome-marketing', [
                'user' => $notifiable,
                'password' => $this->password,
                'loginUrl' => url('/login'),
                'appName' => config('app.name'),
                'features' => $features,
                'socialLinks' => $socialLinks,
                'quickStartGuides' => $quickStartGuides,
                'supportInfo' => $supportInfo,
                'companyInfo' => [
                    'name' => config('app.company_name', config('app.name')),
                    'address' => config('app.company_address', '123 rue de l\'Innovation, 75000 Paris'),
                    'registration' => config('app.company_registration', 'RCS Paris B 123 456 789'),
                    'website' => config('app.url')
                ],
                'brandColors' => [
                    'primary' => '#4299E1',
                    'secondary' => '#2B6CB0',
                    'accent' => '#EBF4FF'
                ],
                'brandAssets' => [
                    'logo' => asset('assets/images/logo.png'),
                    'logo_dark' => asset('assets/images/logo.png'),
                    'hero_image' => asset('assets/images/welcome-hero.jpg')
                ]
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'type' => 'welcome',
            'user_id' => $notifiable->id,
            'email_sent' => true,
            'sent_at' => now()
        ];
    }
}
