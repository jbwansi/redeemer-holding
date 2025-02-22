<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez {{ config('app.name') }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        :root {
            --primary-color: #DA2E29;
            --text-color: #1F2937;
            --border-radius-sm: 8px;
            --border-radius-md: 12px;
            --border-radius-lg: 16px;
            --border-radius-xl: 24px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: #F3F4F6;
            padding: 32px 16px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: var(--border-radius-lg);
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .brand-header {
            background-color: #ffffff;
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid #E5E7EB;
        }

        .logo {
            color: var(--primary-color);
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .header {
            background-color: var(--primary-color);
            color: white;
            padding: 32px 24px;
            text-align: center;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
        }

        .content {
            padding: 32px 24px;
        }

        .welcome-box {
            background-color: #F9FAFB;
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }

        .user-info {
            background-color: #F3F4F6;
            border-radius: var(--border-radius-md);
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid var(--primary-color);
        }

        .feature-list {
            margin: 24px 0;
            padding-left: 20px;
        }

        .feature-item {
            margin-bottom: 12px;
            display: flex;
            align-items: flex-start;
        }

        .feature-icon {
            margin-right: 12px;
            color: var(--primary-color);
        }

        .button {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 14px 28px;
            border-radius: var(--border-radius-md);
            text-decoration: none;
            font-weight: 600;
            margin-top: 24px;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: #C02A25;
        }

        .contact-section {
            background-color: #F9FAFB;
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin-top: 32px;
            text-align: center;
        }

        .contact-item {
            display: inline-flex;
            align-items: center;
            margin: 8px 16px;
            color: #4B5563;
        }

        .footer {
            background-color: #F9FAFB;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
        }

        .disclaimer {
            font-size: 12px;
            color: #6B7280;
            margin-top: 16px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="brand-header">
            <div class="logo">
                <img src="{{ asset('assets/images/logo.png') }}" alt="{{ config('app.name') }}" width="140">
            </div>
        </div>
        <div class="header">
            <h1>Rappel : Votre événement commence demain</h1>
        </div>

        <div class="content">
            <p>Bonjour {{ $participant->name }},</p>

            <p>Nous vous rappelons que l'événement "{{ $participant->formation->title }}" commence demain.</p>

            <div class="details">
                <h3>Détails de l'événement :</h3>
                <ul>
                    <li>Date : {{ $participant->formation->start_date->format('d/m/Y') }}</li>
                    <li>Heure : {{ $participant->formation->start_date->format('H:i') }}</li>
                    <li>Lieu : {{ $participant->formation->location }}</li>
                    <li>Référence : {{ $participant->reference }}</li>
                </ul>
            </div>

            <div class="instructions">
                <h3>Instructions importantes :</h3>
                <p>N'oubliez pas d'apporter :</p>
                <ul>
                    <li>Votre pièce d'identité</li>
                    <li>Votre numéro de référence</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <strong>{{ config('app.name') }}</strong>
            <p>La vie que vous méritez à portée de main !</p>

            <div class="social-links">
                <a href="{{ get_setting('facebook') }}" class="social-link">Facebook</a>
                <a href="{{ get_setting('twitter') }}" class="social-link">Twitter</a>
                <a href="{{ get_setting('instagram') }}" class="social-link">Instagram</a>
                <a href="{{ get_setting('linkedin') }}" class="social-link">LinkedIn</a>
            </div>

            <p class="disclaimer">
                Cet e-mail a été envoyé automatiquement suite à votre inscription.
                Si vous n'êtes pas à l'origine de cette inscription, veuillez nous contacter.
            </p>
        </div>

    </div>
</body>

</html>
