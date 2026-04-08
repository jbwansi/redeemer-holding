<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation d'inscription</title>
    <style>
        /* Styles similaires à votre exemple */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F3F4F6;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
        }

        .header {
            background: #DA2E29;
            color: white;
            padding: 30px;
            text-align: center;
        }

        .content {
            padding: 30px;
        }

        .event-card {
            background: #F9FAFB;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
        }

        .meeting-link {
            background: #EFF6FF;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>✅ Inscription confirmée !</h1>
            <p>Votre place est réservée pour la formation</p>
        </div>

        <div class="content">
            <p>Bonjour <strong>{{ $participant->name }}</strong>,</p>

            <p>Votre inscription à la formation <strong>{{ $formation->title }}</strong> a été confirmée avec succès.
            </p>

            @if (!empty($customMessage))
                <div class="meeting-link" style="text-align: left;">
                    <p>{{ $customMessage }}</p>
                </div>
            @endif

            <div class="event-card">
                <h3>{{ $formation->title }}</h3>

                <div class="detail-row">
                    <span>📅 Date :</span>
                    <span>{{ $formation->start_date->format('d/m/Y') }}</span>
                </div>

                <div class="detail-row">
                    <span>🕐 Horaires :</span>
                    <span>{{ $formation->start_date->format('H:i') }} - {{ $formation->end_date->format('H:i') }}</span>
                </div>

                <div class="detail-row">
                    <span>📍 Lieu :</span>
                    <span>{{ $formation->location }}</span>
                </div>

                <div class="detail-row">
                    <span>👥 Places :</span>
                    <span>{{ $participant->qty }} place(s)</span>
                </div>

                @if ($formation->price > 0)
                    <div class="detail-row">
                        <span>💰 Prix :</span>
                        <span>{{ number_format($formation->price * $participant->qty, 0, ',', ' ') }} CHF</span>
                    </div>
                @endif
            </div>

            @if ($hasMeetingLink)
                <div class="meeting-link">
                    <h4>🔗 Lien de meeting</h4>
                    <p>Rejoignez la formation via ce lien :</p>
                    <a href="{{ $formation->meeting_link }}" target="_blank"
                        style="color: #2563EB; word-break: break-all;">
                        {{ $formation->meeting_link }}
                    </a>
                    <p style="margin-top: 10px; font-size: 14px; color: #6B7280;">
                        Ce lien sera actif à l'heure de la formation.
                    </p>
                </div>
            @endif

            <p>Nous vous contacterons prochainement avec plus de détails.</p>

            <p>Cordialement,<br>L'équipe de formation</p>
        </div>
    </div>
</body>

</html>
