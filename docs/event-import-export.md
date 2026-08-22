# Event JSON — audit et contrat d’export

## Audit du domaine

`events` contient le contenu portable de l’événement, une FK vers `event_categories`, une FK d’auteur, des compteurs de vues et les réglages de publication/capacité. `event_participants` porte toutes les données d’inscription, paiement, remboursement, billet et check-in.

Le slug de `events` est unique en base et sert d’identité portable. La catégorie est référencée par le slug unique du catalogue métier partagé `categories`; son nom est fourni comme libellé descriptif. Aucun ID SQL n’est exporté.

Le stockage maintient aussi `event_categories` comme table miroir pour la FK historique. Son hook de création préfixe actuellement les slugs de manière aléatoire : ce slug miroir ne peut pas servir de clé inter-environnements. La relation `Event::category()`, les formulaires et leurs validations utilisent tous `categories`; l’export suit donc cette source métier. L’import devra bloquer si le slug partagé est absent ou ambigu et recréer/valider le miroir dans sa transaction.

## Contrat 1.0

```json
{
  "schema_version": "1.0",
  "type": "event",
  "exported_at": "2026-08-22T10:00:00+02:00",
  "data": {
    "title": "Sommet",
    "slug": "sommet-2026",
    "description": "Présentation",
    "content": "<p>Contenu</p>",
    "start_date": "2026-09-22T10:00:00+02:00",
    "end_date": "2026-09-22T13:00:00+02:00",
    "location": "Genève",
    "featured_image": {"original": "events/sommet.jpg"},
    "category": {"slug": "conference", "name": "Conférence"},
    "max_participants": 120,
    "price": "90.50",
    "is_published": true,
    "is_featured": false,
    "published_at": null,
    "tags": ["réseau"]
  }
}
```

La whitelist exclut `id`, `category_id`, `user_id`, `views`, timestamps techniques et soft delete. Elle exclut entièrement participants, utilisateurs, inscriptions, paiements/Stripe, factures, remboursements, billets/QR, check-in, données personnelles, logs et statistiques.

## Différences avec Training

Event n’a ni sections, leçons, ressources ni quiz : aucun `stable_id` enfant n’est nécessaire. Il possède en revanche une catégorie externe portable par slug. Son image vedette suit le même principe que Training (chemins bruts, jamais les URL calculées); l’export JSON ne copie pas encore les fichiers. Un package ZIP pourra être ajouté à l’étape médias si l’import Event le justifie.

La phase d’export n’ajoute aucun import, update ou suppression. Elle ne modifie aucun flux d’inscription, capacité, paiement, annulation, billet ou check-in.

## Analyse read-only

L’analyseur accepte uniquement `schema_version: 1.0` et `type: event`. Les clés racine, Event et catégorie sont vérifiées par whitelist stricte; tout champ inattendu, notamment transactionnel, est bloquant. L’Event est recherché exclusivement par slug, y compris parmi les lignes soft-deleted pour éviter une création conflictuelle. La catégorie est résolue exclusivement par `categories.slug` et n’est jamais créée.

Le rapport expose `valid`, `status`, `event`, `category`, `changes`, `errors`, `warnings` et un `plan` read-only. Le plan porte les actions `CREATE`, `UPDATE`, `UNCHANGED`, `PRESERVE` ou `AMBIGUOUS`, avec `deleted: 0` et `can_apply: false`. Ce plan ne déclenche jamais directement une écriture; la création possède sa propre confirmation et sa propre revalidation.

## Création réelle

`EventJsonImporter` reçoit uniquement le contenu du fichier, l’identifiant de l’admin authentifié et le nom du fichier. Il rejoue intégralement `EventJsonImportAnalyzer`; aucun statut ou plan frontend n’est accepté comme autorité. Dans une transaction unique, il verrouille et résout à nouveau `categories.slug`, puis refuse tout `events.slug` existant, y compris soft-deleted.

Le mapping de création reprend seulement la whitelist du contrat : titre, slug, description, contenu, dates, lieu, référence `featured_image`, catégorie résolue, capacité, prix, publication, mise en avant, date de publication et tags. `user_id` vient exclusivement de l’admin authentifié. Aucun ID source, participant ou champ transactionnel n’est lu ou écrit. La catégorie n’est ni créée ni synchronisée.

La référence média est enregistrée telle quelle; aucun fichier physique n’est copié. Le rapport de succès expose l’Event, la catégorie, `created.events: 1`, les avertissements et `deleted: 0`. Les packages ZIP restent hors périmètre.

## Update réel non destructif

`EventJsonUpdateApplier` effectue une prévalidation complète, puis ouvre une transaction. Dans celle-ci, il verrouille l’Event recherché exclusivement par slug avec `withTrashed`, verrouille la catégorie recherchée exclusivement par `categories.slug`, et recalcule le rapport avec `EventJsonImportAnalyzer`. Seuls les champs marqués `UPDATE` et présents dans la whitelist sont écrits. Le slug n’appartient pas à la whitelist d’update.

Une cible soft-deleted, absente ou ambiguë bloque l’opération sans restore. Une catégorie absente ou ambiguë bloque également l’opération; aucune catégorie ni miroir n’est créé. Un rapport `UNCHANGED` ne déclenche aucun appel Eloquent `update`, ce qui rend les applications suivantes idempotentes.

Le comportement historique des formulaires Event désactive les autres Events lorsqu’un Event devient vedette, mais cette règle est située dans le contrôleur et n’est imposée ni par le modèle ni par la base. L’update JSON n’applique volontairement pas cet effet global : `is_featured` ne modifie que l’Event ciblé et un avertissement explicite est retourné. Cela respecte le caractère non destructif et évite un effet de bord caché.

Participants, inscriptions, paiements, remboursements, factures, billets, QR, check-in, vues et autres données transactionnelles ne sont jamais chargés pour rapprochement ni écrits. Ils sont `PRESERVE`; `deleted` reste toujours à `0`. `featured_image` reste une référence, sans copie ni suppression de fichier physique.

La navigation backend partagée comporte désormais `Évènements > Import / Export`, route `events.import-export`. Le composant de menu est commun à la sidebar et à la navigation responsive; les middlewares `admin.access` et `active` restent portés par les routes dashboard.
