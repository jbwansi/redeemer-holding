# Checklist Pré-Prod Paiement

Date de révision: 2026-07-07
Responsable release: ____________________
Version / tag: ____________________

## 1) Sécurité et configuration

- [ ] Variables sensibles correctement définies en production (`APP_KEY`, clés provider paiement, SMTP, etc.).
- [ ] Aucune clé secrète hardcodée dans le code ou exposée dans les logs.
- [ ] `APP_DEBUG=false` en production.
- [ ] CORS et domaines autorisés vérifiés pour le frontend paiement.
- [ ] Webhook paiement protégé par signature et secret valide.
- [ ] Vérification rapide exécutée: `./scripts/payment-preprod-check.ps1 -EnvFile .env`

## 2) Intégrité métier du paiement

- [ ] Montant et devise recalculés et validés côté serveur avant confirmation.
- [ ] Statut de commande/panier vérifié côté serveur (pas uniquement côté frontend).
- [ ] Idempotence activée (pas de double débit, pas de double validation commande).
- [ ] Gestion explicite des états: `pending`, `paid`, `failed`, `refunded`, `canceled`.
- [ ] Protection contre double clic / double soumission sur le parcours UI.

## 3) Webhooks et résilience

- [ ] Endpoint webhook testé avec signature valide et invalide.
- [ ] Traitement webhook idempotent (replay sécurisé).
- [ ] Timeouts, retries et backoff configurés côté jobs/queues.
- [ ] Événements hors ordre (arrivée tardive) gérés sans corruption d’état.
- [ ] Cas d’échec temporaire rejouable sans effets de bord.

## 4) Tests indispensables avant release

- [ ] Test parcours paiement réussi (happy path).
- [ ] Test paiement refusé (carte rejetée / erreur provider).
- [ ] Test timeout / indisponibilité provider.
- [ ] Test replay webhook (même événement reçu plusieurs fois).
- [ ] Test permissions: accès public/client/admin correctement isolés.

## 5) Observabilité et exploitation

- [ ] Logs structurés avec identifiant de corrélation (request id / order id / payment id).
- [ ] Aucune donnée sensible en clair dans les logs (PAN, CVC, secrets).
- [ ] Alertes configurées sur: erreurs 5xx, jobs failed, taux d’échec paiement.
- [ ] Dashboard minimal disponible: volume paiements, taux succès, latence webhook.
- [ ] Procédure d’incident paiement documentée (contacts, rollback, communication).

## 6) UX et communication utilisateur

- [ ] Messages utilisateur clairs selon état (`en cours`, `réussi`, `échoué`, `vérification en cours`).
- [ ] Page de retour paiement robuste (rechargement supporté, état récupérable).
- [ ] Email/notification de confirmation déclenché une seule fois.
- [ ] Parcours mobile vérifié (responsive + lenteur réseau).

## 7) Go / No-Go final

- [ ] Smoke test complet passé sur environnement de pré-prod.
- [ ] Validation conjointe produit + technique + support.
- [ ] Plan de rollback validé et testé.
- [ ] Fenêtre de déploiement et monitoring post-release planifiés.
- [ ] Décision finale Go/No-Go signée.

---

## Journal de validation

- Date:
- Validé par:
- Blocages restants:
- Décision:
