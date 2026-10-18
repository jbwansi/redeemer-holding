# Blog Redeemer Holding — validation phase 6

Date : 14 octobre 2026 (Europe/Zurich).

**Décision : NO-GO production à ce stade.** Les vérifications locales passent,
mais aucune recette sur le serveur staging, aucune exécution sur MySQL et aucune
inspection visuelle dans un navigateur n'ont été réalisées. Ce document ne vaut
ni autorisation de déploiement ni validation finale de staging.

## Périmètre et traçabilité

- Inspection du dépôt et de la configuration locale uniquement ; aucun SSH,
  HTTP vers staging, connexion à une base distante, push, tag ou déploiement.
- Tests Laravel sur SQLite `:memory:`, avec environnement `testing`, DB_URL vide
  et configuration cachée contournée. Aucune base applicative existante utilisée.
- PHP local 8.2.12 ; Node local 22.14.0. Le pipeline utilise PHP 8.4 et Node 22 :
  les tests locaux ne remplacent pas une exécution du pipeline sur la RC.
- Branche locale develop, HEAD 059bb204. Les changements des phases 2–6 sont
  encore dans le répertoire de travail, largement non suivis ; ils ne font pas
  partie d'une RC publiée. Les succès locaux portent sur ce répertoire de travail.
- Aucun secret, contenu de clé ou mot de passe n'est nécessaire dans ce rapport.

## Résultats réellement obtenus

| Vérification | Résultat | Portée |
| --- | --- | --- |
| PHPUnit ciblé | **83 tests / 644 assertions réussis** | Blog public, identités, schéma SQLite, compilation MySQL, modération, autorisations, régressions et sécurité du mail staging simulée localement |
| Vitest | **15 tests réussis, 3 fichiers** | 12 parcours publics, 2 tests modération, 1 test newsletter ; environnement jsdom, pool threads, un worker |
| Vite production | **Réussi** | Sortie temporaire hors public/build ; aucune publication des assets |
| TypeScript | **Échec global : 349 diagnostics** | Même nombre qu'en phase 5 ; aucun diagnostic sur les nouveaux fichiers blog, la page de détail, la navigation ou les composants de modération |
| Compilation des cinq migrations avec MySqlConnection | **Réussie** | Grammaire MySQL, connexion PDO interdite par le test ; ce n'est pas une exécution SQL |
| Cache des routes Laravel | **Réussi** | Fichier temporaire isolé, supprimé ensuite ; huit endpoints publics et deux administratifs présents |
| Format PHP des fichiers de phase 6 | **Réussi** | Laravel Pint |
| git diff --check | **Réussi** | Aucun défaut d'espacement détecté |
| MySQL réel | **Non exécuté** | Pas de MySQL isolé disponible ; le binaire local détecté est MariaDB, non démarré et non utilisé |
| Visuel navigateur | **Non exécuté** | Navigateur intégré indisponible ; inventaire des navigateurs vide |
| Recette staging | **Non exécutée** | Autorisation préalable requise par l'utilisateur |

Le build avertit que les données Browserslist sont anciennes et que le dossier
de sortie temporaire n'est pas vidé. Ces avertissements ne font pas échouer le
build. Aucune dépendance n'a été mise à jour.

Une première tentative de cache des routes avec un chemin absolu Windows a
échoué car Laravel l'a interprété comme relatif. Le même contrôle a ensuite
réussi avec un chemin relatif temporaire. Aucun cache applicatif existant n'a
été écrasé.

Un serveur d'aperçu local à API simulée a été démarré pour préparer le contrôle
visuel. Faute de navigateur disponible, aucune capture ni interaction visuelle
n'a été validée. Ce serveur a été arrêté et son fichier temporaire supprimé.
Les tests jsdom ne sont pas des vérifications de mise en page.

## Pipeline staging identifié et compatibilité

Sources inspectées :

- `.github/workflows/ci.yml` : branche develop / PR, PHP 8.4, Node 22,
  dépendances verrouillées, build Vite, tests Laravel, vérification des espaces.
- `.github/workflows/deploy-staging.yml` : préparation de release sur les tags
  `v*-rc.*`, installation des dépendances et build. Ce workflow ne déploie pas
  le serveur et ne transfère pas son build vers celui-ci.
- `scripts/deploy-staging.ps1` : préparation interactive locale, build, tests,
  commit/push/tag avec confirmations, puis lancement du script staging par SSH.
- `scripts/deploy-release.sh` : clone du tag, vérification des assets présents
  dans Git, liaison des ressources partagées, dépendances PHP, état des migrations,
  sauvegarde MySQL, confirmation explicite des migrations et de la bascule,
  reconstruction des caches, tests HTTP et possibilité de retour du code.

**Le pipeline n'a pas été exécuté ni modifié.** Les ajouts utilisent les mécanismes
existants de migrations, routes, ressources Inertia et compilation Vite.

Points à traiter avant toute RC autorisée :

1. Revoir et inclure explicitement les fichiers des phases 2–6 dans le commit.
   Éviter d'accepter aveuglément le `git add .` proposé par le script interactif.
2. Le serveur attend `public/build/manifest.json` et ses assets dans le tag cloné.
   Les builds de validation temporaires ne mettent pas ces fichiers à jour.
   Refaire le build prévu par le pipeline et inclure ses assets dans la RC.
   Un succès du workflow GitHub ne suffit pas à mettre à jour les assets du tag.
3. Confirmer l'environnement staging et l'isolement de toutes ses connexions
   DB/cache/session avant toute connexion. Le script paramétrable ne constitue
   pas à lui seul une preuve que la destination est hors production.
4. Examiner toutes les migrations en attente : le script lance les migrations
   en attente globalement, pas uniquement les cinq migrations du blog.
5. Les smoke tests du script ne couvrent pas les interactions du blog. Ajouter
   leur recette manuelle après déploiement autorisé, sans changer le pipeline.
6. Le rollback du script ne revient que sur le code. Aucun rollback SQL, aucune
   suppression des nouvelles tables ou des données ne sera exécuté pour la recette.

## Examen SQL et MySQL

Les cinq migrations ont été relues sans modification. Aucun nom d'index ou de
contrainte compilé ne dépasse 64 caractères. Le test de compilation utilise
utf8mb4 / utf8mb4_unicode_ci et InnoDB. La configuration applicative MySQL a
`strict=true`, mais laisse le moteur au défaut serveur : **InnoDB et le mode SQL
effectif restent à vérifier sur staging**.

| Table | Contraintes et index principaux |
| --- | --- |
| blog_actors | user_id unique nullable, FK users SET NULL ; token_hash unique nullable ; kind ENUM anonymous/user ; expiration indexée |
| post_likes | UNIQUE(post_id, blog_actor_id) ; FK article CASCADE, acteur RESTRICT |
| post_ratings | mêmes FK et unicité ; rating ENUM('1','2','3','4','5') |
| post_comments | statut ENUM, défaut pending ; unicité acteur/submission_key ; index article/statut/date/id, statut/date, acteur/hash/date ; FK article CASCADE, acteur RESTRICT |
| post_comment_moderation_logs | FK commentaire CASCADE ; modérateur SET NULL ; anciens/nouveaux statuts ENUM ; index commentaire/date |

Les ENUM MySQL ne sont pas des colonnes entières : Eloquent expose la note en
entier et les endpoints la valident avant écriture. En mode SQL strict, les
valeurs hors domaine doivent être rejetées. `AVG(rating + 0)` exploite les indices
ENUM 1–5, actuellement identiques aux notes ; ne pas réordonner ce domaine.
Tester sur MySQL réel les notes 1–5, les rejets 0/6, la moyenne 2 et 5 = 3,5,
les contraintes uniques, les FK et la concurrence. La compilation seule ne
prouve aucun de ces comportements en exécution.

## Configuration : connu localement, inconnu sur le serveur

La configuration locale observée est local / SQLite / cache fichier / URL HTTP.
Elle n'est pas présentée comme configuration staging. Le fichier staging partagé
est externe au dépôt et n'a pas été consulté.

Contrôles à réaliser après autorisation, sans afficher les valeurs sensibles :

- APP_ENV = staging, APP_DEBUG désactivé, APP_URL en HTTPS, clé applicative
  présente et stable entre releases (sans lire sa valeur dans le rapport).
- DB_CONNECTION MySQL, base et compte dédiés au staging confirmés avant toute
  requête ; prise en compte de DB_URL et des configurations mises en cache.
- Version réelle MySQL, mode strict de la connexion, moteur InnoDB, état des
  migrations, index et contraintes effectivement installés.
- SESSION_SECURE_COOKIE=true, SESSION_HTTP_ONLY=true, SESSION_SAME_SITE=lax,
  portée du domaine excluant le partage avec la production ; session partagée
  entre workers si nécessaire.
- CACHE_STORE database ou redis partagé entre workers ; cache distinct de la
  production. Contrôler aussi DB_CACHE_CONNECTION, REDIS_CACHE_CONNECTION,
  SESSION_CONNECTION et les préfixes, sans se connecter à une destination non
  préalablement confirmée. Vérifier les tables cache/cache_locks le cas échéant.
- HTTPS/proxy : contrôle réel du Set-Cookie depuis le navigateur et des en-têtes
  transmis ; pas de confiance aveugle dans un X-Forwarded-Proto arbitraire.
- Désactivation des envois de mails réels conformément aux protections staging
  existantes ; ne pas utiliser les seeders globaux pour cette recette du blog.

### Correction locale effectuée

`BlogActorService` forçait Secure en production mais pas en staging. Derrière une
terminaison TLS proxy, `Request::isSecure()` peut être faux : le cookie staging
pouvait alors ne pas porter Secure. Le service force désormais Secure dans les
deux environnements. Test ajouté pour staging avec une requête HTTP interne et
X-Forwarded-Proto=https ; succès réel. HttpOnly, SameSite=Lax, chemin /blogs et
expiration serveur restent couverts. Aucun middleware global ni pipeline modifié.

Cette correction locale n'est pas encore déployée. La configuration effective du
cookie de session Laravel et du proxy reste à contrôler sur staging.

## Scénarios : preuves locales et recette distante restante

| Scénario | Exécuté localement | Staging |
| --- | --- | --- |
| Ajouter/retirer un like, compteur et idempotence | PHPUnit + Vitest réussis | À faire, y compris actualisation navigateur |
| Note 1–5, modification/retrait, moyenne/compteur | PHPUnit + Vitest réussis | À faire sur MySQL |
| Commentaire anonyme, nom requis, texte limité | PHPUnit + Vitest réussis | À faire |
| pending absent de la liste, confirmation de modération | PHPUnit + Vitest réussis | À faire |
| Approbation, refus, spam, remise en attente | Matrice des 16 paires de statuts testée | À faire via back-office |
| Journal privé, rollback de transaction, conflit de version | PHPUnit réussi | À faire avec deux administrateurs simultanés |
| Pagination publique et filtres/pagination admin | PHPUnit + Vitest réussis | À faire dans le navigateur |
| CSRF effectivement activé | Requêtes sans jeton refusées dans PHPUnit | À faire, cookie/session réelle |
| Cookies altérés/expirés, compte inactif, identité séparée | PHPUnit réussi | À faire |
| Rate limits, honeypot, délai, doublons | PHPUnit réussi | À faire avec cache partagé et plusieurs workers |
| 422, 429, réseau, draft conservé | Vitest réussi | À faire avec réseau navigateur |
| Articles brouillons, futurs, supprimés | Tous les endpoints publics testés en 404 | À faire avec fixtures dédiées |
| Clavier des étoiles et confirmations admin | Tests DOM réussis | Navigation clavier réelle à faire |
| Mobile/tablette/ordinateur, clair/sombre, focus/contraste | Code relu, aucun rendu validé | À faire |
| Aucun rechargement Inertia pour les interactions | Appels Axios vérifiés en tests et code | Vérifier onglet Réseau navigateur |
| SEO, vues, articles similaires, CRUD éditorial | Tests de régression pertinents réussis, diff du détail limité au montage du composant | Vérification visuelle/HTTP finale à faire |

## Exécution staging préparée, non autorisée à ce stade

**Lot A — audit en lecture seule, à autoriser séparément.** Utiliser exclusivement
l'accès staging déjà prévu dans les scripts. Vérifier la destination, la release
active, APP_ENV, les connexions dédiées et les paramètres masqués. Ne faire aucune
requête DB avant d'avoir confirmé son isolement de la production. Lire ensuite
version/mode SQL et métadonnées des cinq tables, état des migrations et paramètres
cache/session. Ne pas lancer le script de déploiement pour un simple audit.
Ne pas utiliser le preflight existant sans filtrer ses erreurs : il peut imprimer
des détails de connexion si une exception survient.

**Lot B — préparation/déploiement RC, autorisation distincte.** Utiliser uniquement
le pipeline actuel après revue du commit, des assets et du tag. Confirmation de
la sauvegarde staging, des migrations en attente et de la bascule. Aucune action
de production. Si les endpoints ne sont pas encore déployés, leur recette est
bloquée jusqu'à cette étape autorisée.

**Lot C — recette avec écritures de test, autorisation distincte.** Prévoir un
article et des comptes dédiés, marqués par un identifiant de recette unique.
Ne modifier aucun article/commentaire existant. Créer des fixtures dédiées pour
brouillon, publication future et corbeille ; 11 commentaires approuvés pour la
pagination publique et 21 commentaires au total pour la pagination admin.
Conserver les fixtures et le journal ; aucun nettoyage/destruction automatique.

Ordre de recette :

1. Navigateur anonyme : likes PUT/DELETE, rechargement, notes 1 puis 5 puis retrait.
   Second navigateur isolé : notes 2 et 5 pour vérifier moyenne 3,5 et compteur 2.
2. Soumission avec prénom et texte ; vérifier pending et absence publique.
   Administrateur : approuver, vérifier la publication, puis refuser ou spammer
   une contribution de test et constater son retrait public.
3. Deux administrateurs ouvrent la même révision : première décision acceptée,
   seconde refusée ; contrôler un seul journal pour la décision gagnante.
4. Accès invité/client au back-office refusé, mutations sans CSRF refusées,
   données hors domaine rejetées, faux identifiants client ignorés, motifs internes
   absents du JSON public. Évaluer les seuils sur les seules fixtures de recette.
5. Comparer cookies avant/après actualisation : même identité, Secure/HttpOnly,
   SameSite, expiration et portée. Ne pas exposer les valeurs dans les captures.
   Ne pas avancer l'horloge du serveur pour tester l'expiration : utiliser une
   identité de recette expirée via une opération explicitement autorisée.
6. Vérifier 390, 768 et 1280 pixels, clair/sombre, clavier Tab/Espace/flèches,
   focus, confirmation admin, erreurs réseau et états en cours. Captures sans
   informations personnelles ; les fixtures ne doivent contenir que du texte fictif.
7. Onglet Réseau : mutations JSON, pas de navigation document/Inertia complète,
   pas d'incrément de vues lors des interactions ; relire les métadonnées SEO et
   constater la conservation du contenu, images et articles similaires.

Pour les contrôles SQL d'intégrité/concurrence destructive, utiliser une base de
test MySQL distincte, expressément autorisée. **Ne jamais lancer PHPUnit avec
RefreshDatabase, migrate:fresh, un rollback ou un seeder global contre staging
existant ou production.** Les seules suppressions fonctionnelles prévues sont
les likes/notes créés par cette recette sur son article dédié.

## Conditions de levée du NO-GO

- Destination staging et base isolée confirmées, lot A autorisé puis exécuté.
- RC revue contenant code, correction Secure et assets cohérents ; pipeline
  existant exécuté uniquement après autorisation distincte.
- Métadonnées et comportements réels MySQL vérifiés ; concurrence testée.
- Recette fonctionnelle et visuelle réelle documentée sans échec bloquant.
- Dette TypeScript globale reconnue explicitement ; aucun nouveau diagnostic
  lié au blog. Si le projet exige un typecheck global vert, le NO-GO demeure
  jusqu'au traitement de cette dette dans une intervention distincte.
- Validation finale explicite de l'utilisateur avant tout déploiement production.

## Fichiers de cette phase

- Modifié : app/Services/Blog/BlogActorService.php (Secure en staging).
- Modifié : tests/Feature/Blog/BlogActorServiceTest.php (cas proxy staging).
- Créé : tests/Unit/Blog/BlogMySqlSchemaCompilationTest.php (aucune connexion DB).
- Créé : docs/blog-staging-validation-report.md (ce rapport et la recette).
- Modifié : docs/blog-interactions-foundations.md (contrat Secure actualisé).

Les autres modifications visibles dans Git proviennent des phases précédentes.
