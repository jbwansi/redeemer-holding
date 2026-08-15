# Dataset de recette staging A383

Le dataset est strictement réservé à `APP_ENV=staging`. Il n'est pas appelé par
`DatabaseSeeder` et ne contient ni email ni mot de passe de recette dans Git.

## Configuration requise

Configurer hors dépôt :

- `ACCEPTANCE_ADMIN_EMAIL`
- `ACCEPTANCE_CLIENT_EMAIL`
- `ACCEPTANCE_FORBIDDEN_EMAIL`
- `ACCEPTANCE_TEST_PASSWORD` (12 caractères minimum)
- `TEST_ALLOWED_EMAILS` contenant `ACCEPTANCE_CLIENT_EMAIL`, mais jamais
  `ACCEPTANCE_FORBIDDEN_EMAIL`

`ACCEPTANCE_DATASET_ID` vaut `A383-v1` par défaut. Changer cette valeur revient
à versionner un nouveau dataset et doit faire l'objet d'une validation dédiée.

## Provisioning

Prévisualisation sans mutation :

```bash
php artisan acceptance:provision --dry-run
```

Application idempotente :

```bash
php artisan acceptance:provision --apply
```

Équivalent via le seeder dédié :

```bash
php artisan db:seed --class=StagingAcceptanceSeeder
```

Un second apply valide le manifeste `A383-v1` existant et ne recrée aucune
ligne. Tout conflit d'email ou de slug sans manifeste exact provoque un refus.

## Cleanup

Toujours commencer par le dry-run :

```bash
php artisan acceptance:cleanup A383-v1 --dry-run
```

Après validation explicite :

```bash
php artisan acceptance:cleanup A383-v1 --apply
```

Le cleanup vérifie chaque identité et empreinte de fichier. Il refuse de
continuer si des données issues des workflows UI (inscriptions, progressions,
quiz, demandes, participants ou sessions) dépendent encore du dataset. Ces
données doivent être inventoriées et nettoyées séparément avant de réessayer.
