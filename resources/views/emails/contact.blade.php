<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redeemer Holding - Nouveau message de contact</title>
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
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .content {
            padding: 32px 24px;
        }

        .sender-details {
            background-color: #F9FAFB;
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #E5E7EB;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #E5E7EB;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: 500;
            color: #6B7280;
        }

        .message-box {
            background-color: #F3F4F6;
            border-radius: var(--border-radius-md);
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid var(--primary-color);
            white-space: pre-line;
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

        .alert-box {
            background-color: #FEF2F2;
            color: #991B1B;
            border-radius: var(--border-radius-md);
            padding: 16px;
            margin: 24px 0;
            border: 1px solid #FEE2E2;
            font-size: 14px;
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
                <img src="{{ asset('assets/images/logo.webp') }}" alt="Redeemer Holding" width="100">
            </div>
        </div>

        <div class="header">
            <h1>Nouveau message de contact</h1>
            <p>Quelqu'un vous a envoyé un message depuis le formulaire de contact</p>
        </div>

        <div class="content">
            <p>Un nouveau message a été reçu via le formulaire de contact du site web :</p>

            <div class="sender-details">
                <div class="detail-row">
                    <span class="detail-label">Date et heure</span>
                    <span>{{ $date }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Nom</span>
                    <span>{{ $name }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span>{{ $email }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Sujet</span>
                    <span>{{ $subject }}</span>
                </div>
                @if($ipAddress)
                <div class="detail-row">
                    <span class="detail-label">Adresse IP</span>
                    <span>{{ $ipAddress }}</span>
                </div>
                @endif
            </div>

            <h3>Message :</h3>
            <div class="message-box">
                {{ $messageContent }}
            </div>

            <div class="alert-box">
                <strong>Attention :</strong> Ne répondez pas directement à cet email. Pour répondre à cette personne, utilisez l'adresse email indiquée ci-dessus.
            </div>

            <center>
                <a href="mailto:{{ $email }}?subject=RE: {{ $subject }}" class="button">
                    Répondre au message
                </a>
            </center>

            <div class="contact-section">
                <h3>Coordonnées de l'entreprise</h3>
                <div class="contact-item">📞 {{ get_setting('company_phone') }}</div>
                <div class="contact-item">✉️ {{ get_setting('support_email') }}</div>
            </div>
        </div>

        <div class="footer">
            <strong>Redeemer Holding</strong>
            <p>La vie que vous méritez à portée de main !</p>

            <div class="social-links">
                <a href="{{ get_setting('facebook') }}" class="social-link">Facebook</a>
                <a href="{{ get_setting('twitter') }}" class="social-link">Twitter</a>
                <a href="{{ get_setting('instagram') }}" class="social-link">Instagram</a>
                <a href="{{ get_setting('linkedin') }}" class="social-link">LinkedIn</a>
            </div>

            <p class="disclaimer">
                Cet e-mail a été envoyé automatiquement suite à une soumission du formulaire de contact.
            </p>
        </div>
    </div>
</body>

</html>
