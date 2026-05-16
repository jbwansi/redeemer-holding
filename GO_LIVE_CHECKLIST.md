# Checklist Go Live Laravel – Redeemer Holding

## 1. Préparation serveur

- [ ] Serveur web configuré (Nginx/Apache, PHP 8.1+, Composer, Node.js)
- [ ] Accès SSH sécurisé
- [ ] Certificat SSL (Let’s Encrypt ou autre) installé
- [ ] Variables d’environnement (.env) adaptées (APP_ENV=production, APP_DEBUG=false, etc.)

## 2. Déploiement code

- [ ] Pull du code à jour (branche main/master)
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `npm ci && npm run build`
- [ ] `php artisan key:generate` (si première install)

## 3. Base de données & stockage

- [ ] `php artisan migrate --force`
- [ ] `php artisan db:seed` (si besoin de données de base)
- [ ] `php artisan storage:link`
- [ ] Permissions correctes sur storage/, bootstrap/cache, public/storage

## 4. Services & sécurité

- [ ] Config mail (MAIL_MAILER, MAIL_HOST, etc.) testée
- [ ] Config queue (QUEUE_CONNECTION=database/redis)
- [ ] Supervisord/pm2/daemon pour queue:work
- [ ] Cache config/route/view :
  - `php artisan config:cache`
  - `php artisan route:cache`
  - `php artisan view:cache`
- [ ] Forcer HTTPS (redirection serveur ou middleware)
- [ ] Vérifier robots.txt et sitemap.xml

## 5. Fonctionnel & SEO

- [ ] Test navigation desktop/mobile
- [ ] Test inscription, paiement, newsletter
- [ ] Test formulaires de contact/services
- [ ] Vérifier titres/meta/og sur pages clés
- [ ] Google Search Console : soumettre sitemap.xml
- [ ] Google Analytics/Matomo/Pixel installé

## 6. Monitoring & backup

- [ ] Logs Laravel accessibles (storage/logs)
- [ ] Sauvegarde base de données (automatique ou manuelle)
- [ ] Sauvegarde fichiers (storage/app/public)
- [ ] Outil de monitoring (uptime, erreurs, etc.)

---

**Astuce** : Après chaque étape, valider sur le site réel (mobile + desktop, navigation privée, etc.).

Bon déploiement !
