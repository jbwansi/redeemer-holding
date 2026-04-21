<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Confirmation abonnement</title>
</head>
<body style="margin:0; padding:0; background:#0b1220; font-family:Arial, Helvetica, sans-serif; color:#ffffff;">
    <div style="max-width:600px; margin:0 auto; padding:40px 24px;">
        
        <h1 style="font-size:28px; margin-bottom:16px;">
            Confirmez votre abonnement
        </h1>

        <p style="font-size:16px; line-height:1.6; margin-bottom:16px;">
            Merci pour votre inscription avec l’adresse :
            <strong>{{ $email }}</strong>
        </p>

        <p style="font-size:16px; line-height:1.6; margin-bottom:24px;">
            Pour finaliser votre inscription à la newsletter, cliquez sur le bouton ci-dessous :
        </p>

        <p style="margin-bottom:32px;">
            <a href="{{ $confirmUrl }}"
               style="display:inline-block;
                      background:#ef3b2d;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 24px;
                      border-radius:10px;
                      font-weight:bold;">
                Confirmer mon abonnement
            </a>
        </p>

        <p style="font-size:14px; line-height:1.6; color:#cbd5e1;">
            Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.
        </p>

    </div>
</body>
</html>