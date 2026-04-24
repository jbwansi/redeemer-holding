<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau lead chatbot</title>
</head>

<body>
    <h2>Nouveau lead depuis le chatbot</h2>

    <p><strong>Email :</strong> {{ $lead->email }}</p>
    @if($lead->name)
        <p><strong>Nom :</strong> {{ $lead->name }}</p>
    @endif
    <p><strong>Source :</strong> {{ $lead->source }}</p>
    <p><strong>Date de capture :</strong> {{ $lead->created_at->format('d/m/Y H:i') }}</p>

    @if($lead->notes)
        <p><strong>Notes :</strong> {{ $lead->notes }}</p>
    @endif

    <p>Ce prospect a laissé ses coordonnées via le chatbot du site web et souhaite être recontacté.</p>

    <p>Connectez-vous à l'administration pour plus de détails et pour le recontacter.</p>
</body>

</html>