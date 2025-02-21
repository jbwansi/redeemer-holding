<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Reset CSS pour meilleure compatibilité */
        body, html, table, td, th, div, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.5;
        }

        /* Styles de base avec fallbacks */
        .email-wrapper {
            width: 100% !important;
            max-width: 640px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        /* En-tête avec couleur principale */
        .email-header {
            padding: 40px 20px;
            text-align: center;
            background: #ffffff;
            background-color: #ffffff;
        }

        .logo {
            max-width: 180px;
            width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        /* Corps avec structure table pour compatibilité */
        .email-body {
            background-color: #ffffff;
            width: 100%;
        }

        /* Bannière de bienvenue */
        .welcome-banner {
            background-color: #ed2525;
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
        }

        .welcome-banner h1 {
            font-size: 24px;
            margin-bottom: 15px;
            font-weight: bold;
            color: #ffffff;
        }

        .content-wrapper {
            padding: 40px 20px;
        }

        /* Zone des identifiants */
        .credentials-section {
            background-color: #F8F8F8;
            border-left: 4px solid #ed2525;
            padding: 20px;
            margin: 30px 0;
        }

        .credential-item {
            background-color: #ffffff;
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid #E5E5E5;
        }

        /* Bouton optimisé pour les emails */
        .button-wrapper {
            text-align: center;
            margin: 30px 0;
        }

        .cta-button {
            background-color: #ed2525;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            text-align: center;
            border-radius: 4px;
        }

        /* Features avec tables pour compatibilité */
        .feature-item {
            background-color: #F8F8F8;
            padding: 20px;
            margin-bottom: 20px;
        }

        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
            display: block;
        }

        /* Étapes simplifiées */
        .step-item {
            margin-bottom: 20px;
            padding-left: 40px;
            position: relative;
        }

        .step-number {
            position: absolute;
            left: 0;
            top: 0;
            background-color: #ed2525;
            color: #ffffff;
            width: 28px;
            height: 28px;
            text-align: center;
            line-height: 28px;
            border-radius: 50%;
            font-weight: bold;
        }

        /* Support section */
        .support-section {
            background-color: #F8F8F8;
            padding: 30px 20px;
            text-align: center;
            margin: 30px 0;
        }

        /* Footer compatible */
        .email-footer {
            background-color: #333333;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }

        .social-links {
            margin: 20px 0;
            font-size: 0;
        }

        .social-link {
            color: #ffffff;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .footer-links a {
            color: #ffffff;
            text-decoration: none;
            margin: 0 10px;
            font-size: 12px;
        }

        .footer-text {
            color: #cccccc;
            font-size: 12px;
            margin-top: 20px;
        }

        /* Responsive minimal */
        @media screen and (max-width: 480px) {
            .content-wrapper {
                padding: 20px 15px;
            }

            .welcome-banner {
                padding: 30px 15px;
            }

            .credentials-section {
                padding: 15px;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" valign="top">
                <table class="email-wrapper" width="640" cellpadding="0" cellspacing="0" border="0">
                    <!-- En-tête -->
                    <tr>
                        <td class="email-header">
                            <img src="{{ asset('assets/images/logo.png') }}" alt="{{ $appName }}" class="logo">
                        </td>
                    </tr>

                    <!-- Corps -->
                    <tr>
                        <td class="email-body">
                            <!-- Bannière -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="welcome-banner">
                                        <h1>Bienvenue sur {{ $appName }} !</h1>
                                        <p style="color: #ffffff;">Votre espace personnel est prêt à être utilisé</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Contenu -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="content-wrapper">
                                        <p>Bonjour {{ $user->name }},</p>

                                        <div class="credentials-section">
                                            <h3 style="color: #ed2525;">📝 Vos identifiants de connexion</h3>
                                            <div class="credential-item">
                                                <strong>Email:</strong> {{ $user->email }}
                                            </div>
                                            <div class="credential-item">
                                                <strong>Mot de passe temporaire:</strong> {{ $password }}
                                            </div>
                                        </div>

                                        <div class="button-wrapper">
                                            <a href="{{ $loginUrl }}" class="cta-button">
                                                Accéder à mon espace
                                            </a>
                                        </div>

                                        <!-- Features -->
                                        @foreach($features as $feature)
                                        <div class="feature-item">
                                            <span class="feature-icon">{{ $feature['icon'] }}</span>
                                            <h4 style="color: #ed2525;">{{ $feature['title'] }}</h4>
                                            <p>{{ $feature['description'] }}</p>
                                        </div>
                                        @endforeach

                                        <!-- Support -->
                                        <div class="support-section">
                                            <h3 style="color: #333333;">🤝 Besoin d'aide ?</h3>
                                            <p>Notre équipe support est disponible pour vous accompagner</p>
                                            <div class="button-wrapper">
                                                <a href="mailto:{{ get_setting("support_email") }}" class="cta-button">
                                                    Contacter le support
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="email-footer">
                                        <div class="social-links">
                                            <a href={{ get_seeting('linkedin_url') }} class="social-link">LinkedIn</a>
                                            <a href={{ get_seeting('twitter_url') }} class="social-link">Twitter</a>
                                            <a href={{ get_seeting('facebook_url') }} class="social-link">Facebook</a>
                                        </div>
                                        <div class="footer-links">
                                            <a href={{ route('cookies.show') }}>Politiques des cookies</a>
                                            <a href={{ route('policy.show') }}>Politique de confidentialité</a>
                                            <a href={{ route('terms.show') }}>Conditions d'utilisation</a>
                                        </div>
                                        <p class="footer-text">
                                            © {{ date('Y') }} {{ $appName }}. Tous droits réservés.<br>
                                            Cet email a été envoyé à {{ $user->email }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
