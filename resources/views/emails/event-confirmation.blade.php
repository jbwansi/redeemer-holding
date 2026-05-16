<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redeemer Holding - Confirmation de votre réservation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        :root {
            --primary-color: #DA2E29;
            --text-color: #1F2937;
            --border-radius-sm: 8px;
            --border-radius-md: 12px;
            --border-radius-lg: 16px;
            --border-radius-xl: 24px;
            /* Tailles de police standardisées */
            --text-xs: 12px;
            --text-sm: 14px;
            --text-base: 16px;
            --text-lg: 18px;
            --text-xl: 20px;
            --text-2xl: 24px;
            --text-3xl: 30px;
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
            font-size: var(--text-2xl);
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
            font-size: var(--text-2xl);
            font-weight: 600;
            margin-bottom: 8px;
        }

        .content {
            padding: 32px 24px;
        }

        .event-card {
            background-color: #F9FAFB;
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #E5E7EB;
        }

        .event-title {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 16px;
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

        .detail-value {
            font-weight: 500;
            text-align: right;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: var(--border-radius-xl);
            font-size: var(--text-xs);
            font-weight: 600;
            text-align: center;
            background-color: #D1FAE5;
            color: #065F46;
        }

        .reference-highlight {
            background-color: #FEF3C7;
            padding: 16px;
            border-radius: var(--border-radius-md);
            text-align: center;
            margin: 24px 0;
            border: 2px dashed #F59E0B;
        }

        .reference-code {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: #92400E;
            letter-spacing: 2px;
        }

        .message-box {
            background-color: #EFF6FF;
            border-radius: var(--border-radius-md);
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid var(--primary-color);
        }

        .important-info {
            background-color: #FEF3C7;
            border-radius: var(--border-radius-md);
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #F59E0B;
        }

        .button {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 14px 28px;
            border-radius: var(--border-radius-md);
            text-decoration: none;
            font-weight: 600;
            margin: 12px 8px;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: #B91C1C;
        }

        .button-secondary {
            background-color: #6B7280;
        }

        .button-secondary:hover {
            background-color: #4B5563;
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
            font-size: var(--text-xs);
            color: #6B7280;
            margin-top: 16px;
        }

        .price-total {
            font-size: var(--text-lg);
            font-weight: 700;
            color: var(--primary-color);
        }

        @media (max-width: 600px) {
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }

            .detail-value {
                text-align: left;
            }

            .button {
                display: block;
                text-align: center;
                margin: 12px 0;
            }
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
            <h1>✅ Réservation confirmée !</h1>
            <p>Votre place est réservée pour cet événement</p>
        </div>

        <div class="content">
            <p>Bonjour {{ $participant->name }},</p>

            <div class="message-box">
                <p><strong>Félicitations !</strong> Votre réservation pour l'événement a été confirmée avec succès. Nous
                    sommes ravis de vous compter parmi nos participants.</p>
            </div>

            @if (!empty($customMessage))
                <div class="message-box">
                    <p>{{ $customMessage }}</p>
                </div>
            @endif

            <div class="reference-highlight">
                <p style="margin-bottom: 8px; color: #92400E; font-weight: 500;">Votre référence de réservation</p>
                <div class="reference-code">{{ $participant->reference }}</div>
                <p style="margin-top: 8px; font-size: 14px; color: #6B7280;">Conservez cette référence précieusement</p>
            </div>

            <div class="event-card">
                <h3 class="event-title">{{ $event->title }}</h3>

                <div class="detail-row">
                    <span class="detail-label">📅 Date</span>
                    <span class="detail-value">{{ $event->start_date->format('d/m/Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🕐 Heure</span>
                    <span class="detail-value">{{ $event->start_date->format('H:i') }} -
                        {{ $event->end_date->format('H:i') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📍 Lieu</span>
                    <span class="detail-value">{{ $event->location ?? 'À confirmer' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👥 Nombre de places</span>
                    <span class="detail-value">{{ $participant->qty }}
                        {{ $participant->qty > 1 ? 'places' : 'place' }}</span>
                </div>
                @if ($event->price > 0)
                    <div class="detail-row">
                        <span class="detail-label">💰 Prix total</span>
                        <span
                            class="detail-value price-total">{{ number_format($event->price * $participant->qty, 0, ',', ' ') }}
                            DH</span>
                    </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">📧 Email</span>
                    <span class="detail-value">{{ $participant->email }}</span>
                </div>
                @if ($participant->phone)
                    <div class="detail-row">
                        <span class="detail-label">📱 Téléphone</span>
                        <span class="detail-value">{{ $participant->phone }}</span>
                    </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">✅ Statut</span>
                    <span class="status-badge">Confirmé</span>
                </div>
            </div>

            @if ($event->description)
                <div class="message-box">
                    <h4 style="margin-bottom: 12px;">À propos de l'événement</h4>
                    <p>{{ Str::limit(strip_tags($event->description), 200) }}</p>
                </div>
            @endif

            <div class="important-info">
                <h4 style="margin-bottom: 12px; color: #92400E;">⚠️ Intrainings importantes</h4>
                <ul style="padding-left: 20px; color: #92400E;">
                    <li>Présentez-vous 15 minutes avant le début de l'événement</li>
                    <li>Munissez-vous de votre référence de réservation</li>
                    <li>Une pièce d'identité pourra vous être demandée</li>
                    @if ($event->price > 0)
                        <li>Votre paiement a été traité avec succès</li>
                    @endif
                </ul>
            </div>

            <center>
                <a href="{{ route('events.show', $event->slug) }}" class="button">
                    📋 Voir les détails de l'événement
                </a>
                @if (auth()->check())
                    <a href="{{ route('events.registration.confirmation', ['slug' => $event->slug, 'participant_id' => $participant->id]) }}"
                        class="button button-secondary">
                        🎫 Télécharger mon billet
                    </a>
                @endif
            </center>

            <div class="contact-section">
                <h3>Une question ? Contactez-nous</h3>
                <div class="contact-item">📞 {{ get_setting('company_phone', '+212 123 456 789') }}</div>
                <div class="contact-item">✉️ {{ get_setting('support_email', 'info@redeemerholding.com') }}</div>
                <p style="margin-top: 16px; color: #6B7280; font-size: 14px;">
                    Notre équipe est disponible du lundi au vendredi de 9h à 18h
                </p>
            </div>
        </div>

        <div class="footer">
            <strong>Redeemer Holding</strong>
            <p>La vie que vous méritez à portée de main !</p>

            <div class="social-links">
                <a href="{{ get_setting('facebook', '#') }}" class="social-link">Facebook</a>
                <a href="{{ get_setting('twitter', '#') }}" class="social-link">Twitter</a>
                <a href="{{ get_setting('instagram', '#') }}" class="social-link">Instagram</a>
                <a href="{{ get_setting('linkedin', '#') }}" class="social-link">LinkedIn</a>
            </div>

            <p class="disclaimer">
                Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre directement.
                <br>
                Pour toute question, utilisez nos coordonnées ci-dessus.
            </p>
        </div>
    </div>
</body>

</html>
