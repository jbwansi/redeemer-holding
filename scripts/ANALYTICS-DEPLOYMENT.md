# Analytics après déploiement

Les lanceurs PowerShell copient puis exécutent en SSH les scripts distants
`deploy-release.sh` (staging) et `deploy-production-release.sh` (production).
Les workflows GitHub Actions actuels valident le code et les builds ; ils ne
déploient pas sur Infomaniak.

Les deux scripts relient `.env` et `storage` à leurs équivalents dans `shared`,
puis exécutent déjà `optimize:clear` et `config:cache` (après activation en
staging, avant activation en production). Ces commandes restent à leur place,
sans doublon. `config/services.php` lit `GA_PROPERTY_ID` et `GA_CREDENTIALS_PATH` ;
le service du dashboard utilise ces valeurs via `config()`, compatible avec le
cache Laravel.

Après activation, `analytics:check-config --shared="$SHARED"` vérifie les valeurs
de configuration, la présence et la lisibilité du JSON, son type et ses champs
obligatoires, et son emplacement réel dans `shared`, hors répertoires publics
ou temporaires Laravel. Il ne crée pas de client Google, ne fait aucun appel
réseau et ne modifie aucun fichier. Son échec reste non bloquant et les scripts
n'affichent qu'un message générique, même en cas d'erreur de démarrage Laravel.

Le chemin configuré doit être relatif à la racine de l'application, conformément
au service existant : par exemple `storage/app/analytics/credentials.json` pointe
vers le fichier persistant `shared/storage/app/analytics/credentials.json`.
La suppression de `storage` dans une release ne suit pas le lien symbolique
(aucun slash final) et ne supprime donc pas son contenu partagé. Aucun script
ne copie, ne remplace ni ne purge le JSON partagé. Ne pas placer ce fichier dans
`storage/app/public`, `storage/framework` ou un répertoire propre à une release.

Aucun identifiant ni paramètre d'environnement n'est changé automatiquement.
Un avertissement nécessite de contrôler la configuration déjà provisionnée sur
le serveur ; depuis la release active, la commande suivante donne uniquement
des diagnostics génériques, sans valeurs ni contenu du JSON :

```sh
php artisan analytics:check-config --shared="$DEPLOY_ROOT/shared"
```

Utiliser les variables de chemin et le binaire PHP du déploiement concerné.
Le succès confirme uniquement la configuration locale : les permissions GA4,
la validité cryptographique de la clé et la disponibilité Google ne sont pas
testées. Les environnements distants ne sont pas validés par les tests locaux.
