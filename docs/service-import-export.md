# Import / export des services

Le parcours canonique se trouve dans **Dashboard → Services → Import / Export**.

## Identité et versions

- Le format courant est **Service JSON 1.0**.
- Le package média est **Service Package ZIP 1.0**.
- Le `slug` unique est l’unique identité portable. Aucun ID de base de données ni `stable_id` n’est transporté.
- Le slug sert à déterminer `CREATE` ou la cible d’une mise à jour et n’est jamais modifié par celle-ci.

## Enveloppe JSON

```json
{
  "schema_version": "1.0",
  "type": "service",
  "exported_at": "2026-08-24T12:00:00+02:00",
  "data": {
    "name": "Coaching individuel",
    "slug": "coaching-individuel",
    "excerpt": "Résumé",
    "content": "<p>Contenu</p>",
    "icon": "userRound",
    "image": { "disk": "public", "path": "services/coaching.webp" },
    "tagline": "Accroche",
    "featured_note": "Note",
    "ideal_for": ["Prendre du recul", "Structurer un objectif"],
    "cta_primary": { "label": "Faire une demande", "url": "/contact" },
    "cta_secondary": { "label": "Découvrir", "url": "https://example.test/services/coaching-individuel" },
    "publication": {
      "status": true,
      "position": 1,
      "is_featured": false,
      "featured_badge": null,
      "featured_order": 0
    }
  }
}
```

Les clés inconnues et les données sensibles sont refusées. `id`, `user_id`, `views`, timestamps, demandes de service, témoignages, données personnelles et données de paiement sont toujours exclus.

## Absence, `null` et plan

- Une propriété absente produit `PRESERVE` et conserve la valeur locale.
- Une propriété présente avec `null` demande explicitement une mise à null lorsque le champ l’autorise.
- `CREATE` crée uniquement un slug absent.
- `UPDATE` applique uniquement les différences annoncées.
- `UNCHANGED` ne produit aucune écriture utile.
- `AMBIGUOUS` bloque toute application, notamment en cas de conflit de position.
- `DELETE` reste toujours égal à zéro.

L’analyse est sans écriture. La création ou la mise à jour relance l’analyse dans une transaction et verrouille la cible nécessaire avec `lockForUpdate`.

## Validation métier

- `ideal_for` est une liste ordonnée de chaînes non vides.
- Les CTA acceptent un chemin interne commençant par `/` ou une URL HTTP/HTTPS. Les autres schémas et les URL `//...` sont refusés.
- `position` est nulle ou comprise entre 1 et 3. Une position occupée bloque l’import sans déplacer l’autre service.
- L’image utilise uniquement le disque `public` et un chemin relatif sous `services/`.

## JSON et médias

Un import JSON ne copie aucun fichier. Si l’image référencée existe déjà sur le disque public, sa référence peut être appliquée. Sinon, l’analyse affiche un avertissement et aucun fichier n’est inventé.

Les références locales détectées dans le HTML de `content` sont signalées, mais ces fichiers ne sont ni collectés ni copiés. Le HTML reste inchangé.

## Package ZIP 1.0

Le ZIP contient :

- `service.json` ;
- `manifest.json` ;
- l’image principale disponible sous `media/services/...`.

Le manifeste conserve le type `service-package`, la version du schéma, le slug et, pour chaque média, sa taille et son SHA-256. L’infrastructure commune refuse les chemins dangereux, liens symboliques, fichiers spéciaux, limites anormales, médias non déclarés et falsifications d’intégrité.

Un fichier cible identique est réutilisé. Un contenu différent au même chemin bloque l’import sans écrasement. Si l’import DB échoue, seuls les fichiers nouvellement copiés sont supprimés ; un fichier préexistant n’est jamais supprimé.

## Procédure

1. Exporter en JSON ou ZIP.
2. Sélectionner le fichier dans la page Import / Export.
3. Lancer l’analyse.
4. Vérifier l’action, les différences, `PRESERVE`, les ambiguïtés et les avertissements médias.
5. Confirmer explicitement la création ou la mise à jour.

Seuls Service JSON 1.0 et Service Package ZIP 1.0 sont acceptés. Les formats Training et Event restent séparés et incompatibles par leur champ `type`.
