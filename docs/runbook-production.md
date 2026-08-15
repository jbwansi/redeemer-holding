# Runbook Production - Redeemer Holding

Ce document sert de guide d'exploitation pour les mises en production, la supervision, la securite et la gestion d'incidents.

## 1. Prerequis

- PHP, Composer, Node.js et npm installes sur le serveur de build/deploiement.
- Base de donnees accessible.
- Variables d'environnement de production renseignees.
- HTTPS configure et teste sur le domaine de production.
- Stripe configure avec cles reelles (pas les placeholders).
- Worker de queue actif (driver `database` dans le projet actuel).
- Cache partage et persistant entre les workers (Redis ou equivalent), requis pour l'idempotence newsletter.

## 2. Variables critiques a verifier

Verifier au minimum dans `.env` de production:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` correct
- `DB_*` correct
- `CACHE_STORE` pointe vers le cache partage de production
- `SESSION_DRIVER` adapte a une execution multi-instance
- `QUEUE_CONNECTION=database`
- `MAIL_*` correct
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax` (ou `strict` selon vos besoins)
- `FORCE_HTTPS=true` si HTTPS est termine au niveau app/reverse-proxy
- `REMINDER_CRON_TOKEN` fort et unique
- `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` valides
- `TEST_ALLOWED_EMAILS` vide en production ; en staging, liste explicite des seuls comptes autorises
- `TEST_USERS_PASSWORD` vide en production ; secret obligatoire uniquement pour un seeding staging explicitement voulu

## 3. Procedure de deploiement

### 3.0 Creation du premier administrateur

Les seeders ne creent aucun administrateur et ne contiennent aucun identifiant par defaut.
Apres avoir configure l'environnement et applique les migrations, creer le premier compte
depuis un terminal securise sur le serveur:

```bash
php artisan admin:create
```

La commande demande le nom, l'adresse email, le mot de passe masque et sa confirmation,
puis exige une confirmation explicite avant la creation. Elle refuse une adresse deja
utilisee et applique les memes regles de mot de passe que l'application. Ne jamais placer
le mot de passe administrateur dans `.env`, un script de deploiement ou l'historique du shell.

### 3.1 Nouvelle installation

1. Configurer et verifier l'environnement et la connexion DB.
2. Executer `php artisan deployment:preflight`.
3. Continuer uniquement si la commande confirme `Fresh database`.
4. Executer `php artisan migrate --force`.
5. Creer le premier administrateur avec `php artisan admin:create`.
6. Executer uniquement les seeders explicitement autorises ci-dessous.
7. Verifier `migrate:status`, relancer le preflight et effectuer les smoke tests.

Un backup n'est pas applicable si la base est reellement vierge. Le preflight verifie
aussi l'absence de schema applicatif et de migrations enregistrees ; l'absence des seules
tables de formations ne suffit pas.

### 3.2 Mise a jour d'une base existante

- Faire un backup MySQL complet avant toute migration.
- Verifier que le fichier de sauvegarde existe, n'est pas vide et peut etre lu.
- Restaurer idealement cette sauvegarde dans une base isolee et verifier les volumes
  de donnees avant de poursuivre.
- Valider la branche a deployer et le changelog.
- Verifier l'etat des migrations a venir.
- Conserver la version ou le commit actuellement deploye pour permettre un retour rapide.

Executer ensuite, dans cet ordre:

```bash
php artisan migrate:status
php artisan deployment:preflight
```

Le preflight doit reussir avant `migrate --force`. Il refuse notamment la coexistence
de `formations` avec `trainings`, ou de `formation_participants` avec
`training_participants`. Ne supprimer, fusionner ou renommer manuellement aucune de ces
tables sans sauvegarde valide et analyse explicite de leurs donnees et cles etrangeres.

Interrompre immediatement le deploiement en cas d'ambiguite. Apres `migrate --force`,
executer un nouveau `migrate:status`, un nouveau `deployment:preflight`, puis les smoke
tests. Ne jamais utiliser `migrate:fresh` en staging ou en production.

#### Reprise apres l'echec MySQL 1824 de v1.0.0-rc.1

L'echec sur `2026_06_14_182445_create_training_lessons_table` est provoque par une
contrainte vers `training_sections` avant la creation de cette table. MySQL annule le
`CREATE TABLE` fautif et Laravel n'enregistre pas cette migration. Avant reprise:

1. faire et verifier un backup complet;
2. confirmer avec `php artisan migrate:status` que la migration `182445` est `Pending`;
3. confirmer que `training_lessons` et `training_sections` sont absentes; si l'une des
   deux existe, interrompre la reprise et analyser explicitement le schema et les donnees;
4. deployer le correctif, puis executer `php artisan deployment:preflight` et
   `php artisan migrate --force`;
5. verifier que la migration corrective `191632` est executee et que la FK
   `training_lessons_training_section_id_foreign` reference `training_sections(id)` avec
   `ON DELETE CASCADE`.

Ne jamais inserer manuellement la migration `182445` dans la table `migrations`, ni
supprimer une table LMS existante pour forcer la reprise.

### 3.3 Commandes de deploiement

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate:status
php artisan deployment:preflight
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

`storage:link` est necessaire car le projet publie des medias depuis `storage/app/public`.

Verifier ensuite les permissions d'ecriture du compte PHP sur:

```bash
storage
bootstrap/cache
```

Apres migration, verifier au minimum:

```bash
php artisan migrate:status
php artisan deployment:preflight
```

Controler aussi les volumes de `trainings` et `training_participants`, plusieurs
inscriptions sentinelles, leurs references de paiement, puis les acces LMS. En cas
d'anomalie, suspendre les ecritures, conserver les logs et revenir au code precedent.
Ne restaurer la sauvegarde que dans le cadre de la procedure d'incident validee ; ne
pas lancer automatiquement `migrate:rollback` sur ces renommages historiques.

### 3.4 Seeders et comptes de test

`php artisan db:seed` ne cree aucun administrateur. En production et en testing,
`TestUsersSeeder` est toujours ignore. En local et staging, il ne cree rien tant que
`TEST_ALLOWED_EMAILS` et `TEST_USERS_PASSWORD` ne sont pas toutes deux renseignees
explicitement. Le mot de passe doit venir du gestionnaire de secrets du deploiement et
ne doit jamais etre commite.

- `AdminSeeder` : sur en production, aucun compte cree ; utiliser `admin:create`.
- `SettingsSeeder`, `CategorySeeder`, `ServiceSeeder` : installation initiale ; conservateurs sur les contenus existants.
- `PostSeeder`, `EventSeeder`, `TrainingSeeder`, `TrainingLessonSeeder`, `TrainingResourceSeeder`, `TrainingProgressSeeder`, `TrainingEnrollmentSeeder` : demonstration/local uniquement ; ne pas executer en production.
- `TestUsersSeeder`, `TestDashboardActivitiesSeeder` : demonstration/local uniquement et interdits en production.

`DatabaseSeeder` est sur par defaut : les seeders de demonstration ne sont appeles qu'en
environnement local. `TrainingSeeder` refuse aussi une execution directe hors local/testing.

`TrainingSeeder` cree seulement les formations de demonstration absentes. Une formation
existante portant le meme slug et ses participants ne sont jamais remplaces.

### 3.5 Queue worker

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

Apres chaque deploiement, redemarrer proprement les workers afin qu'ils chargent le nouveau code:

```bash
php artisan queue:restart
```

## 3.6 Scheduler

Le scheduler execute les rappels et le controle de sante de la queue. Configurer une execution chaque minute:

```cron
* * * * * cd /var/www/redeemer-holding && php artisan schedule:run >> /dev/null 2>&1
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
- Endpoint `/up` repond correctement.
- `php artisan queue:health-check` reussit avec les seuils de production.

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

## 10. Rollback minimal

En cas de probleme bloquant apres deploiement:

1. Mettre l'application en maintenance si les ecritures doivent etre suspendues.
2. Revenir a la version ou au commit precedemment deploye.
3. Reinstaller les dependances et reconstruire les caches pour cette version.
4. Restaurer la sauvegarde DB uniquement si le code precedent est incompatible avec les migrations appliquees.
5. Utiliser `php artisan migrate:rollback` seulement apres verification explicite que les migrations sont reversibles et qu'aucune donnee ne sera perdue.
6. Redemarrer les workers, sortir de maintenance et refaire les smoke tests.

Ne jamais lancer un rollback de migration ou une restauration DB sans sauvegarde valide et accord du responsable de release.

## 11. Contacts et escalation

Completer cette section avec les contacts internes:

- Responsable technique:
- Responsable produit:
- Contact infra:
- Contact support:

Ajouter ici les canaux d'urgence (email, telephone, canal chat).

---

## Strategie Git et Release Candidate

### Branche `develop`

La branche `develop` est la branche principale d'integration.

Regles :

- les corrections et evolutions sont integrees sur `develop` ;
- chaque push ou pull request doit passer la CI avec succes ;
- une CI verte ne declenche pas automatiquement la creation d'une nouvelle Release Candidate ;
- plusieurs corrections peuvent etre regroupees sur `develop` avant la prochaine RC.

### Creation d'une Release Candidate

Une nouvelle Release Candidate est creee uniquement lorsqu'un lot coherent est reellement pret pour validation sur staging.

Conditions minimales :

- branche `develop` propre ;
- synchronisation avec `origin/develop` ;
- CI GitHub Actions verte ;
- tests Laravel reussis ;
- build Vite reussi ;
- aucune modification locale non commitee ;
- commit precis identifie comme candidat au deploiement.

Une nouvelle RC ne doit pas etre creee uniquement parce qu'un nouveau commit existe.

### Convention de version

Les Release Candidates suivent la convention :

`v1.0.0-rc.N`

Le numero `N` n'est incremente que lorsqu'une nouvelle version doit reellement etre testee sur staging.

### Deploiement staging

Une fois la RC creee :

1. identifier le commit exact ;
2. creer le tag correspondant ;
3. pousser le tag vers GitHub ;
4. deployer cette version sur `test.redeemerholding.com` ;
5. effectuer les tests fonctionnels de staging.

### Corrections apres validation staging

Si une anomalie est trouvee :

1. corriger sur `develop` ;
2. executer les tests ;
3. attendre une CI verte ;
4. creer une nouvelle RC seulement si la correction doit etre redeployee sur staging.

Ne jamais deplacer ou reutiliser un ancien tag RC.

### Promotion vers production

Une RC validee sur staging doit rester immuable.

Si aucun correctif supplementaire n'est necessaire, cette meme version constitue la candidate a la mise en production.

Objectif :

`develop -> RC -> staging -> production`
