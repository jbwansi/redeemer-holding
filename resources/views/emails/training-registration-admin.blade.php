<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle inscription</title>
</head>

<body>
    <h2>Nouvelle inscription à la formation</h2>

    <p><strong>Training :</strong> {{ $formation->title }}</p>
    <p><strong>Participant :</strong> {{ $participant->name }} ({{ $participant->email }})</p>
    <p><strong>Téléphone :</strong> {{ $participant->phone ?? 'Non renseigné' }}</p>
    <p><strong>Nombre de places :</strong> {{ $participant->qty }}</p>
    <p><strong>Référence :</strong> {{ $participant->reference }}</p>
    <p><strong>Date d'inscription :</strong> {{ $participant->created_at->format('d/m/Y H:i') }}</p>

    @if ($formation->meeting_link)
        <p><strong>Lien de meeting :</strong> {{ $formation->meeting_link }}</p>
    @endif

    <p>Connectez-vous à l'administration pour plus de détails.</p>
</body>

</html>
