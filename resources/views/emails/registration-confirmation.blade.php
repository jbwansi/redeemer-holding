<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation</title>
    <style>
        body { font-family: Inter, sans-serif; background:#f3f4f6; color:#111827; margin:0; padding:0; }
        .container { max-width: 600px; margin: 0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.08); }
        .header { background:#da2e29; color:#fff; padding:30px 24px; text-align:center; }
        .content { padding:28px 24px; }
        .details { background:#f9fafb; border-radius:14px; padding:20px; margin:20px 0; }
        .details p { margin:0 0 12px; }
        .footer { padding:24px; color:#6b7280; font-size:14px; text-align:center; }
        .title { font-size:22px; font-weight:700; margin:0 0 10px; }
        .subtitle { color:#f3f4f6; font-size:14px; margin:0; }
        .button { display:inline-block; margin-top:16px; padding:12px 20px; border-radius:10px; background:#da2e29; color:#ffffff !important; text-decoration:none; font-weight:700; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Confirmation</h1>
            <p class="subtitle">
                @if($type === 'event')
                    Votre inscription à l'événement a bien été enregistrée.
                @elseif($type === 'formation')
                    Votre inscription à la formation a bien été enregistrée.
                @elseif($type === 'service')
                    Votre demande de service a bien été reçue.
                @else
                    Votre demande a bien été reçue.
                @endif
            </p>
        </div>

        <div class="content">
            <p>Bonjour {{ $participant->first_name ?? ($participant->name ?? 'Participant') }},</p>

            <p>
                @if($type === 'event')
                    Merci pour votre inscription à <strong>{{ $item->title ?? 'cet événement' }}</strong>.
                @elseif($type === 'formation')
                    Merci pour votre inscription à la formation <strong>{{ $item->title ?? 'cette formation' }}</strong>.
                @elseif($type === 'service')
                    Merci pour votre demande concernant <strong>{{ $item->name ?? $item->title ?? 'ce service' }}</strong>.
                @else
                    Merci pour votre demande.
                @endif
            </p>

            <div class="details">
                <p><strong>Références :</strong></p>
                @if(isset($participant->reference))
                    <p>Référence : {{ $participant->reference }}</p>
                @endif
                <p>Email : {{ $participant->email }}</p>
                @if(!empty($participant->phone))
                    <p>Téléphone : {{ $participant->phone }}</p>
                @endif
            </div>

            @if($type === 'event' && isset($item->start_date))
                <p>Début : {{ \Carbon\Carbon::parse($item->start_date)->format('d/m/Y H:i') }}</p>
            @endif

            @if($type === 'event' && !empty($ticketUrl))
                <p>
                    <a href="{{ $ticketUrl }}" class="button">Afficher mon billet</a>
                </p>
            @endif

            @if($type === 'formation' && isset($item->start_date))
                <p>Début : {{ \Carbon\Carbon::parse($item->start_date)->format('d/m/Y H:i') }}</p>
            @endif

            @if($type === 'service' && !empty($participant->message))
                <p>Message :</p>
                <p>{{ $participant->message }}</p>
            @endif

            <p>Nous vous contacterons bientôt avec plus de détails.</p>
        </div>

        <div class="footer">
            <p>Redeemer Holding</p>
            <p>Merci de votre confiance.</p>
        </div>
    </div>
</body>
</html>
