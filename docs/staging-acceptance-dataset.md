# Dataset de recette UI A383

`A383DemoSeeder` fournit le même dataset métier en `local` et en `staging`.
`production` et tout autre environnement sont refusés. Aucun email, job ou
objet Stripe n'est créé par le seeder.

## Local

`DatabaseSeeder` appelle automatiquement `A383DemoSeeder` uniquement lorsque
`APP_ENV=local`. La commande suivante suffit sur une base de développement :

```bash
php artisan migrate:fresh --seed
```

Credentials locaux, codés exclusivement dans `A383DemoSeeder` et protégés par
le contrôle `APP_ENV=local` :

| Compte | Email | Mot de passe |
|---|---|---|
| Admin | `a383-admin@localhost.test` | `A383-local-demo-2026!` |
| Client autorisé | `a383-client@localhost.test` | `A383-local-demo-2026!` |
| Client interdit | `a383-forbidden@localhost.test` | `A383-local-demo-2026!` |

Le mailer local doit utiliser le transport `array` ou `log`. Pour ajouter le
dataset à une base locale existante :

```bash
php artisan db:seed --class=A383DemoSeeder
```

## Staging

`DatabaseSeeder` n'appelle jamais automatiquement A383 en staging. Configurer
hors dépôt :

- `ACCEPTANCE_ADMIN_EMAIL`
- `ACCEPTANCE_CLIENT_EMAIL`
- `ACCEPTANCE_FORBIDDEN_EMAIL`
- `ACCEPTANCE_TEST_PASSWORD` (12 caractères minimum)
- `TEST_ALLOWED_EMAILS` contenant `ACCEPTANCE_CLIENT_EMAIL`, mais jamais
  `ACCEPTANCE_FORBIDDEN_EMAIL`
- `MAIL_MAILER=array`

Puis exécuter explicitement :

```bash
php artisan db:seed --class=A383DemoSeeder
```

Une configuration absente, un transport autre que `array`, une identité déjà
présente sans manifeste exact ou un environnement interdit provoque un refus.

## Idempotence et commandes acceptance

`A383-v1` utilise un manifeste exact. Un deuxième seed valide ce manifeste et
ne recrée aucune ligne. Les commandes de diagnostic restent disponibles :

```bash
php artisan acceptance:provision --dry-run
php artisan acceptance:provision --apply
```

Après un `migrate:fresh` local, un manifeste résiduel n'est supprimé que si son
identité est valide, ses fichiers sont intacts et aucune identité A383 ne reste
en base.

## Cleanup

```bash
php artisan acceptance:cleanup A383-v1 --dry-run
php artisan acceptance:cleanup A383-v1 --apply
```

Le cleanup vérifie chaque identité et empreinte de fichier. Il refuse de
continuer si des données issues des workflows UI (inscriptions, progressions,
quiz, demandes, participants ou sessions) dépendent encore du dataset.
