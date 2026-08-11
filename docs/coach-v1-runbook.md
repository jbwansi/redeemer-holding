# Coach numérique V1 — Runbook de production

## Périmètre V1

La V1 comprend le Coach général, les entretiens, les CV et candidatures,
l'orientation et carrière, ainsi que les compétences et certifications.
`FakeAIProvider` est le seul provider autorisé : aucun appel IA réseau n'est
effectué. Les certificats restent désactivés avec
`CERTIFICATES_ENABLED=false`.

## Activation et administration

La configuration se fait dans l'administration existante, sous
`/admin/coach`. Elle est réservée à la capacité d'administration existante.
L'accès client est `/dashboard-client/coach` et ne requiert pas de profil
professionnel.

Ordre d'activation recommandé :

1. vérifier que `COACH_AI_PROVIDER=fake` ;
2. configurer les langues, le quota mensuel commun et le rate limit ;
3. activer individuellement les modules souhaités ;
4. activer globalement le Coach ;
5. valider l'accès avec un compte client actif et un compte administrateur.

La désactivation globale ou celle d'un module bloque ses routes sans appeler
le provider. Les données déjà enregistrées ne sont pas supprimées.

## Configuration d'environnement

Valeurs minimales attendues :

```dotenv
COACH_AI_PROVIDER=fake
COACH_MONTHLY_MESSAGE_LIMIT=100
COACH_RATE_LIMIT_PER_MINUTE=10
CERTIFICATES_ENABLED=false
```

Ne jamais ajouter de clé de provider réel à cette V1. L'activation globale,
les modules et les langues sont gérés par la configuration Coach en base.

## Déploiement

```shell
php artisan migrate --force
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan test
```

Après déploiement, contrôler `/admin/coach`, puis
`/dashboard-client/coach` avec et sans profil professionnel. Un client ne doit
jamais pouvoir ouvrir `/admin/coach`.

## Quota, rate limit et consommation

Le quota mensuel est commun à tous les modules pour un utilisateur. Chaque
opération provider est auditée dans `coach_usages`, y compris un échec de
provider. Une requête refusée avant l'appel (module désactivé, quota atteint
ou rate limit) ne doit pas appeler le provider.

Le rate limit s'applique aux routes qui déclenchent une génération. En cas de
hausse anormale, désactiver le module concerné ou le Coach globalement depuis
l'administration avant toute investigation plus large.

## Confidentialité et stockage

Toutes les requêtes métier sont limitées au propriétaire. Une ressource d'un
autre utilisateur répond 404. Le rôle administrateur ne donne pas accès aux
CV, documents, conversations, réponses d'entretien ou analyses individuelles.
Il donne uniquement accès à la configuration et aux métriques agrégées.

Les fichiers sont stockés sur le disque privé `coach_private` et servis par un
contrôleur autorisé. Leur chemin, disque et empreinte ne sont pas exposés dans
l'export utilisateur. Un document référencé par un historique ne peut pas être
supprimé isolément.

`CoachDataExportService` produit un export applicatif du seul utilisateur.
`CoachDataPurgeService` efface ses données Coach et fichiers, sans supprimer
son compte ni les données hors Coach. Ces services sont internes en V1 : aucun
bouton ou endpoint public d'export/purge n'est exposé.

## Journalisation et diagnostic

Les logs Coach contiennent des identifiants techniques, module, opération,
provider, corrélation, durée et statut. Ils ne doivent contenir ni prompt, ni
réponse, ni CV, ni document, ni donnée personnelle détaillée.

Diagnostic rapide :

1. relever le code HTTP et l'identifiant de corrélation ;
2. vérifier activation globale, module, quota et rate limit ;
3. confirmer `COACH_AI_PROVIDER=fake` ;
4. rechercher l'événement technique correspondant sans copier de contenu
   utilisateur dans un ticket ;
5. désactiver le module si l'incident peut altérer des données.

## Contrat pour un futur provider

Une implémentation future devra respecter `AIProviderInterface`, les réponses
texte et structurées, les schémas attendus et les métadonnées d'usage. Elle
devra normaliser timeout, erreur transitoire et erreur permanente, fournir
modèle, tokens, durée et identifiant de requête, sans journaliser le contenu.
Son ajout exige une nouvelle phase, des tests d'intégration et une revue de
sécurité ; il ne fait pas partie de la V1.

## Retour arrière

En cas d'incident, désactiver d'abord globalement le Coach. Restaurer ensuite
la version applicative précédente. Ne revenir sur une migration qu'après une
sauvegarde et une vérification de compatibilité, car un rollback de schéma peut
perdre des données. Les fichiers privés doivent suivre la même politique de
sauvegarde et de restauration que la base.

## Limites connues de la V1

- provider factice uniquement, sans IA réelle ni appel réseau ;
- aucune génération de certificat (`CERTIFICATES_ENABLED=false`) ;
- suggestions de certifications informatives, à vérifier manuellement ;
- aucun paiement ou abonnement Coach ;
- aucun endpoint public d'export ou de purge ;
- aucune lecture administrative automatique des données Coach personnelles ;
- pas de promesse de placement, d'embauche, de certification ou de résultat ;
- contenus générés à relire et adapter par l'utilisateur.

