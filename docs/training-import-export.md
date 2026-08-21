# Import / export des formations

Le parcours canonique se trouve dans **Dashboard → Formations → Import / Export**.

## Formats pris en charge

- **JSON 1.0** : format historique accepté en rétrocompatibilité. Les correspondances sans `stable_id` utilisent les clés métier disponibles et peuvent devenir `AMBIGUOUS`.
- **JSON 1.1** : format courant. Les sections, ressources et questions possèdent un `stable_id` UUID destiné à rester stable entre environnements.
- **Package ZIP 1.0** : contient `training.json`, `manifest.json` et les médias locaux sous `media/`. Le manifeste porte les tailles et SHA-256. Les URL externes ne sont pas embarquées.

## Parcours d’import

L’analyse est obligatoire et n’écrit aucune donnée. Une formation absente peut ensuite être créée ; une formation existante reçoit un plan de mise à jour non destructif.

- `CREATE` ajoute un élément absent.
- `UPDATE` modifie un élément identifié.
- `UNCHANGED` ne produit aucune écriture.
- `PRESERVE` conserve un élément local absent du fichier importé.
- `AMBIGUOUS` bloque l’application tant que la correspondance n’est pas certaine.
- Aucune suppression métier automatique n’est effectuée : **DELETE = 0**.

Pour un ZIP, un média existant de même chemin et même SHA-256 est réutilisé. Un contenu différent au même chemin bloque l’import sans écrasement. Les médias absents du package sont signalés sans être inventés.

La fonction **Importer du contenu pédagogique** reste un parcours distinct : `LegacyTrainingContentJsonAdapter` normalise son ancien format, puis `TrainingContentImporter` crée les sections et leçons dans une formation choisie.

## Commande historique `training:import`

La commande Artisan `training:import` est **legacy**. Elle écrit directement en base et contourne l’analyse, les `stable_id`, le planner/applier et les garanties non destructives du système actuel. Elle ne doit pas être utilisée pour les imports JSON 1.0/1.1 ni pour les packages ZIP modernes. Utiliser exclusivement le parcours canonique du Dashboard décrit ci-dessus.

Sa dépréciation puis sa suppression doivent faire l’objet d’un chantier séparé, après vérification qu’aucune procédure d’exploitation ne dépend encore d’elle.

## Checklist avant validation finale

- migration `stable_id` encore pending sur la vraie base ;
- validation MySQL réelle ;
- extension PHP `ext-zip` à activer ;
- `composer.lock` non synchronisé ;
- avis de sécurité Composer préexistants ;
- deux tests Services préexistants ;
- validation globale Laravel ;
- recette localhost → test ;
- préparation production.
