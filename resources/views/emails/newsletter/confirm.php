<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Confirmation abonnement</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">

    <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">

        <h2 style="color:#111827;">Confirmez votre abonnement</h2>

        <p style="color:#374151;">
            Merci pour votre inscription avec l’adresse :
            <strong>{{ $email }}</strong>
        </p>

        <p style="color:#374151;">
            Pour finaliser votre inscription à la newsletter, cliquez sur le bouton ci-dessous :
        </p>

        <div style="text-align:center; margin:30px 0;">
            <a href="{{ $confirmUrl }}" style="
                    background:#ef3b2d;
                    color:#ffffff;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:8px;
                    display:inline-block;
                    font-weight:bold;
               ">
                Confirmer mon abonnement
            </a>
        </div>

        <!-- ✅ FALLBACK ICI -->
        <p style="font-size:12px; color:#9ca3af;">
            Si le bouton ne fonctionne pas, copiez ce lien :
            <br>
            <a href="{{ $confirmUrl }}">{{ $confirmUrl }}</a>
        </p>


        <p style="color:#6b7280; font-size:14px;">
            Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.
        </p>

    </div>

</body>

</html>