# Runbook Production - Redeemer Holding

Ce document sert de guide d'exploitation pour les mises en production, la supervision, la securite et la gestion d'incidents.

## 1. Prerequis

- PHP, Composer, Node.js et npm installes sur le serveur de build/deploiement.
- Base de donnees accessible.
- Variables d'environnement de production renseignees.
- Stripe configure avec cles reelles (pas les placeholders).
- Worker de queue actif (driver `database` dans le projet actuel).

## 2. Variables critiques a verifier

Verifier au minimum dans `.env` de production:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` correct
- `DB_*` correct
- `QUEUE_CONNECTION=database`
- `MAIL_*` correct
- `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` valides
- `ONLY_TEST_USERS_ENABLED=false` en production ouverte
- `TEST_USER_EMAILS` vide ou strictement maitrise

## 3. Procedure de deploiement

### 3.1 Avant de deployer

- Faire un backup DB.
- Valider la branche a deployer et le changelog.
- Verifier l'etat des migrations a venir.

### 3.2 Commandes de deploiement

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Si vous utilisez les notifications DB pour la cloche:

```bash
php artisan migrate --force
```

### 3.3 Queue worker

L'application envoie certains emails en queue. Le worker doit tourner en continu.

Exemple systemd:

```ini
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/redeemer-holding/artisan queue:work --sleep=3 --tries=3 --timeout=90
WorkingDirectory=/var/www/redeemer-holding

[Install]
WantedBy=multi-user.target
```

Appliquer:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-queue
sudo systemctl status laravel-queue
```

## 4. Verification post-deploiement (smoke checks)

- Homepage charge sans erreur.
- Connexion dashboard OK.
- Formulaires d'inscription evenement/formation OK.
- Paiement Stripe redirige correctement vers checkout.
- Webhook Stripe recu et traite.
- Cloche notifications affiche des donnees et marquage "lu" fonctionne.
- Import CSV users fonctionne.
- Export CSV users telecharge un fichier non vide.
- Pages riches (blog, about, event, formation, services, pages) rendent bien le HTML.

## 5. Securite operationnelle

- Ne jamais exposer de route de maintenance/cron sans protection.
- Restreindre l'acces aux routes admin via middleware et roles.
- Garder `APP_DEBUG=false` en production.
- Tourner les secrets regulierement (mail, Stripe, APP_KEY si necessaire via procedure planifiee).
- Appliquer les mises a jour dependances de securite periodiquement.

## 6. Observabilite minimale

- Surveiller:
  - `storage/logs/laravel.log`
  - statut du worker queue
  - erreurs 5xx HTTP
  - taux d'echec des paiements
- Mettre en place une alerte simple:
  - queue arretee
  - pic d'erreurs 500
  - echec webhook Stripe

## 7. Incidents frequents et reponse rapide

### 7.1 Paiement ne redirige pas

- Verifier `STRIPE_KEY` et `STRIPE_SECRET` (pas de placeholders).
- Verifier les logs Laravel sur la route de creation de session Stripe.
- Verifier la connectivite sortante vers Stripe.

### 7.2 Emails non recus

- Verifier `MAIL_*`.
- Verifier la queue (`failed_jobs`, service queue).
- Relancer les jobs en echec:

```bash
php artisan queue:failed
php artisan queue:retry all
```

### 7.3 Export CSV vide

- Verifier les filtres envoyes.
- Verifier la route d'export utilisee par le frontend.
- Tester en direct l'URL d'export en etant authentifie admin.

### 7.4 Notifications absentes

- Verifier migration table `notifications` appliquee.
- Verifier endpoints notifications accessibles authentifies.
- Verifier polling frontend actif et sans erreurs JS.

## 8. Sauvegarde et restauration

- Backup DB quotidien + retention.
- Backup fichiers `storage/app` si contenu metier.
- Tester une restauration sur environnement de preproduction au moins 1 fois par trimestre.

## 9. Checklist release courte

- [ ] Build frontend OK
- [ ] Migrations appliquees
- [ ] Queue worker actif
- [ ] Stripe/webhook verifies
- [ ] Smoke tests passes
- [ ] Monitoring/alerting verifies

## 10. Contacts et escalation

Completer cette section avec les contacts internes:

- Responsable technique:
- Responsable produit:
- Contact infra:
- Contact support:

Ajouter ici les canaux d'urgence (email, telephone, canal chat).