# Correction du chargement des interactions — 14 octobre 2026

## Cause démontrée

La base SQLite de l'application locale ne contenait aucune des cinq tables
blog_actors, post_likes, post_ratings, post_comments, post_comment_moderation_logs.
La table migrations ne contenait aucune des cinq migrations correspondantes.
Les suites précédentes utilisaient SQLite en mémoire avec RefreshDatabase :
leurs succès ne signifiaient pas que la base locale de développement avait été migrée.

Les logs locaux Laravel contenaient notamment `no such table: blog_actors` et
`no such table: post_comments`. Les requêtes HTTP réelles ont reproduit le défaut
sur un serveur de diagnostic local, lancé depuis ce dépôt sur 127.0.0.1:8016,
avec la base SQLite existante et un article déjà publié :

| Requête sous /blogs/7038-terstersdfg | Avant | Cause HTTP observée | Après |
| --- | --- | --- | --- |
| GET /interactions | 500 JSON | no such table: post_ratings | 200 JSON |
| GET /comments | 500 JSON | no such table: post_comments | 200 JSON |
| POST /interaction-session | 500 JSON | no such table: blog_actors | 200 JSON |

Le POST de diagnostic utilisait une session HTTP et le véritable cookie XSRF-TOKEN
fourni par Laravel, transmis dans X-XSRF-TOKEN. Il ne contournait pas CSRF.
La configuration Ziggy extraite de la page HTML a confirmé les chemins et les
méthodes GET/HEAD, GET/HEAD et POST attendus, sur la même origine locale.
Ce constat provient du serveur HTTP et des logs, pas d'une capture réseau navigateur.

Le message React assimilait les HTTP 500 à une erreur réseau. L'initialisation
du formulaire échouait sur la même table manquante et ne pouvait donc pas fournir
le jeton nécessaire pour activer l'envoi. Aucun défaut de routage, de contrat JSON
ou de CSRF n'a été mis en évidence par ces contrôles.

## Correction effectuée

1. Vérification de garde : APP_ENV local, pilote SQLite, absence de DB_URL,
   chemin réel de la base à l'intérieur du dépôt. Aucune connexion distante.
2. Sauvegarde SQLite cohérente par l'API SQLite3.backup dans :
   `storage/app/private/blog-before-repair-20261014-225741-558eb8.sqlite`.
   Cette sauvegarde contient des données privées et ne doit pas être publiée.
3. Application explicite des seuls cinq fichiers de migration du blog, sans
   migrate:fresh, rollback, suppression de données ou autre migration.
4. Confirmation : les cinq tables et les cinq entrées de migrations existent ;
   les nombres d'articles, utilisateurs et catégories sont inchangés.
5. Amélioration minimale de blogError : un HTTP 5xx affiche une indisponibilité
   serveur, sans fuite du message SQL, des chemins ou de la trace. Une absence de
   réponse HTTP conserve le message réseau. Le contrat API reste identique.

Aucun contrôleur, middleware, modèle, mécanisme CSRF, règle de modération,
permission ou protection anti-spam n'a été désactivé ou modifié pour cette correction.

## Réponses et cookies après correction

- Interactions : champs likes_count, liked, ratings_count, rating_average,
  my_rating et comments_count présents.
- Commentaires : data et meta présents, liste publique issue de l'endpoint approuvé.
- Initialisation : comment_form_token présent ; sa valeur n'est pas publiée.
- Cookie anonyme : HttpOnly, SameSite=Lax, chemin /blogs et expiration présents.
  Secure absent sur ce serveur **local HTTP**, conformément au service ; Secure
  reste forcé en staging et production, avec tests existants conservés.
- Deux initialisations successives avec le même client : 200, sans réémission
  du cookie anonyme. Les sondes ont créé uniquement des identités de diagnostic,
  aucun like, aucune note et aucun commentaire sur l'article existant.
- POST sans X-XSRF-TOKEN : **419** réellement observé après correction.
- Le serveur de diagnostic et les scripts temporaires ont été retirés après les
  vérifications ; le serveur de développement éventuellement déjà ouvert n'a
  pas été arrêté.

## Tests exécutés

- **84 tests Laravel, 668 assertions : tous réussis**, sur SQLite :memory:.
  Inclus : nouveau test reproduisant les trois 500 avec le schéma absent puis
  rétablissant les réponses par application des cinq migrations ; interactions,
  modération, identités, contraintes, CSRF et non-régression existants.
- **19 tests Vitest, quatre fichiers : tous réussis**. Inclus : distinction
  500/502/503 vs réseau, absence de fuite SQL, parcours publics et modération.
- **Compilation Vite réussie**, dans un répertoire temporaire ; aucun déploiement
  ni remplacement des assets publiés. Avertissement Browserslist inchangé.
- **TypeScript : 349 diagnostics globaux préexistants**, comme avant la correction ;
  aucun diagnostic sur blog-interactions.ts, son test ou les composants publics.
- Laravel Pint ciblé, Prettier ciblé et git diff --check réussis.

## Fichiers de cette correction

- Modifié : resources/js/lib/blog-interactions.ts.
- Créé : resources/js/lib/blog-interactions.test.ts.
- Créé : tests/Feature/Blog/BlogMissingMigrationsRegressionTest.php.
- Créé : docs/blog-loading-error-repair.md.
- Opération locale : application des cinq migrations existantes ; aucun fichier
  de migration historique modifié.

## Suite et limites

Sur cette installation locale, aucune migration supplémentaire n'est nécessaire.
Actualiser la page de l'article ; vérifier les compteurs et commentaires, puis
entrer dans le formulaire et attendre son délai de préparation d'environ trois
secondes avant l'envoi. Les boutons like/étoiles et la confirmation de modération
restent à vérifier visuellement dans le navigateur réel.

Staging et production n'ont pas été interrogés ni modifiés. Si le symptôme concerne
également une autre installation, confirmer d'abord son état de migrations et
ses réponses HTTP avec l'autorisation appropriée. La cause démontrée ici concerne
la base locale inspectée ; elle ne constitue pas une preuve de son état distant.
Toute migration staging passe par le pipeline et les autorisations existants.
Ne pas copier la base locale ni lancer de migration directement en production.
