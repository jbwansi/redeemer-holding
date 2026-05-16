<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redeemer Holding - Nouvelle inscription événement</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        :root {
            --primary-color: #DA2E29;
            --success-color: #10B981;
            --warning-color: #F59E0B;
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
            background: linear-gradient(135deg, var(--primary-color) 0%, #B91C1C 100%);
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

        .alert-box {
            background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
            border-radius: var(--border-radius-md);
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #3B82F6;
            text-align: center;
        }

        .alert-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .participant-card {
            background-color: #F9FAFB;
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #E5E7EB;
        }

        .participant-header {
            background-color: var(--success-color);
            color: white;
            padding: 16px;
            border-radius: var(--border-radius-sm);
            margin-bottom: 20px;
            text-align: center;
        }

        .event-card {
            background-color: #FEFEFE;
            border-radius: var(--border-radius-md);
            padding: 24px;
            margin: 24px 0;
            border: 2px solid #E5E7EB;
        }

        .event-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 16px;
            text-align: center;
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
            font-weight: 600;
            text-align: right;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }

        .stat-card {
            background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
            padding: 20px;
            border-radius: var(--border-radius-md);
            text-align: center;
            border: 1px solid #E5E7EB;
        }

        .stat-number {
            font-size: 28px;
            font-weight: 700;
            color: var(--primary-color);
            display: block;
        }

        .stat-label {
            font-size: 14px;
            color: #6B7280;
            margin-top: 4px;
        }

        .reference-highlight {
            background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
            padding: 16px;
            border-radius: var(--border-radius-md);
            text-align: center;
            margin: 24px 0;
            border: 2px dashed var(--warning-color);
        }

        .reference-code {
            font-size: 20px;
            font-weight: 700;
            color: #92400E;
            letter-spacing: 1px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: var(--border-radius-xl);
            font-size: 13px;
            font-weight: 600;
            text-align: center;
        }

        .status-completed {
            background-color: #D1FAE5;
            color: #065F46;
        }

        .status-pending {
            background-color: #FEF3C7;
            color: #92400E;
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

        .footer {
            background-color: #F9FAFB;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }

        .disclaimer {
            font-size: 12px;
            color: #6B7280;
            margin-top: 16px;
        }

        .price-highlight {
            color: var(--success-color);
            font-weight: 700;
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

            .stats-grid {
                grid-template-columns: 1fr;
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
            <h1>🎯 Nouvelle inscription événement</h1>
            <p>Un participant vient de s'inscrire</p>
        </div>

        <div class="content">
            <div class="alert-box">
                <div class="alert-icon">🎉</div>
                <p><strong>Nouvelle inscription reçue !</strong></p>
                <p>Un participant vient de confirmer sa réservation pour votre événement.</p>
            </div>

            <div class="participant-card">
                <div class="participant-header">
                    <h3>👤 Intrainings du participant</h3>
                </div>

                <div class="detail-row">
                    <span class="detail-label">👤 Nom complet</span>
                    <span class="detail-value">{{ $participant->name }}</span>
                </div>
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
                    <span class="detail-label">🎫 Nombre de places</span>
                    <span class="detail-value">{{ $participant->qty }}
                        {{ $participant->qty > 1 ? 'places' : 'place' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Date d'inscription</span>
                    <span class="detail-value">{{ $participant->created_at->format('d/m/Y à H:i') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">✅ Statut</span>
                    <span class="status-badge status-{{ $participant->status }}">
                        {{ $participant->status === 'completed' ? 'Confirmé' : 'En attente' }}
                    </span>
                </div>
            </div>

            <div class="reference-highlight">
                <p style="margin-bottom: 8px; color: #92400E; font-weight: 500;">Référence de réservation</p>
                <div class="reference-code">{{ $participant->reference }}</div>
            </div>

            <div class="event-card">
                <h3 class="event-title">📋 {{ $event->title }}</h3>

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
                @if ($event->price > 0)
                    <div class="detail-row">
                        <span class="detail-label">💰 Revenus générés</span>
                        <span
                            class="detail-value price-highlight">{{ number_format($event->price * $participant->qty, 0, ',', ' ') }}
                            DH</span>
                    </div>
                @else
                    <div class="detail-row">
                        <span class="detail-label">🆓 Type</span>
                        <span class="detail-value">Événement gratuit</span>
                    </div>
                @endif
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">{{ $totalParticipants }}</span>
                    <div class="stat-label">Total inscrits</div>
                </div>
                @if ($availableSeats !== null)
                    <div class="stat-card">
                        <span class="stat-number">{{ $availableSeats }}</span>
                        <div class="stat-label">Places restantes</div>
                    </div>
                @endif
                @if ($event->price > 0)
                    <div class="stat-card">
                        <span
                            class="stat-number">{{ number_format($event->price * $totalParticipants, 0, ',', ' ') }}</span>
                        <div class="stat-label">Revenus total (DH)</div>
                    </div>
                @endif
                <div class="stat-card">
                    <span
                        class="stat-number">{{ round(($totalParticipants / ($event->max_participants ?: 100)) * 100) }}%</span>
                    <div class="stat-label">Taux de remplissage</div>
                </div>
            </div>

            <center>
                <a href="{{ route('events.show', $event->slug) }}" class="button">
                    📊 Voir l'événement
                </a>
                <a href="{{ route('events.participants', $event->slug) }}" class="button button-secondary">
                    👥 Gérer les participants
                </a>
            </center>
        </div>

        <div class="footer">
            <strong>Administration Redeemer Holding</strong>
            <p>Tableau de bord des événements</p>

            <p class="disclaimer">
                Cet e-mail de notification a été envoyé automatiquement lors d'une nouvelle inscription.
                <br>
                Connectez-vous à votre tableau de bord pour plus de détails.
            </p>
        </div>
    </div>
</body>

</html>
