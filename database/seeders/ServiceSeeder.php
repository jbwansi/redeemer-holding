<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $services = [
            [
                'name' => 'Coaching individuel',
                'slug' => 'coaching-individuel',
                'icon' => 'userRound',
                'excerpt' => 'Un accompagnement personnalisé pour clarifier vos priorités et progresser avec méthode.',
                'content' => '<p>Le coaching individuel offre un espace confidentiel pour prendre du recul, préciser vos objectifs et transformer vos intentions en actions concrètes.</p><h2>Une démarche adaptée à votre situation</h2><p>Les échanges s’appuient sur votre contexte, vos ressources et les difficultés que vous rencontrez. Le travail permet d’identifier les leviers utiles, de structurer les prochaines étapes et d’ajuster le plan d’action au fil de votre progression.</p><h2>Axes de travail possibles</h2><ul><li>Clarification des priorités personnelles ou professionnelles</li><li>Prise de décision et passage à l’action</li><li>Développement de la confiance et de la posture</li><li>Organisation d’un plan de progression réaliste</li></ul>',
                'tagline' => 'Clarifier, décider et avancer avec confiance.',
                'ideal_for' => ['Prendre du recul sur une situation', 'Structurer un objectif prioritaire', 'Mettre en place des actions réalistes'],
                'featured_note' => 'Le contenu et le rythme sont adaptés à votre situation.',
            ],
            [
                'name' => 'Coaching d\'équipe',
                'slug' => 'coaching-d-equipe',
                'icon' => 'users',
                'excerpt' => 'Un accompagnement collectif pour renforcer la coopération, la communication et la cohésion.',
                'content' => '<p>Le coaching d’équipe aide un collectif à mieux comprendre son fonctionnement et à construire des pratiques de collaboration adaptées à ses enjeux.</p><h2>Construire une dynamique commune</h2><p>L’accompagnement part des situations vécues par l’équipe : évolution de l’organisation, tensions, nouveaux objectifs ou besoin de mieux coordonner les contributions. Il crée un cadre pour partager les constats et définir des engagements communs.</p><h2>Axes de travail possibles</h2><ul><li>Communication et qualité des interactions</li><li>Clarification des rôles et responsabilités</li><li>Cohésion et confiance au sein du collectif</li><li>Organisation d’actions communes et suivi</li></ul>',
                'tagline' => 'Faire progresser le collectif autour d’objectifs partagés.',
                'ideal_for' => ['Renforcer la cohésion d’équipe', 'Améliorer la communication', 'Accompagner une transition collective'],
                'featured_note' => 'Le format est construit à partir des enjeux du collectif.',
            ],
            [
                'name' => 'Développement du leadership',
                'slug' => 'developpement-du-leadership',
                'icon' => 'trophy',
                'excerpt' => 'Développez une posture de leadership claire, responsable et adaptée à votre environnement.',
                'content' => '<p>Cet accompagnement permet aux managers, dirigeants et responsables de projet de renforcer leur posture et leur capacité à mobiliser autour d’une direction claire.</p><h2>Relier posture et pratiques</h2><p>Le parcours combine réflexion, mise en situation et expérimentation. Il aide à mieux comprendre son impact, à adapter sa communication et à prendre des décisions cohérentes avec les objectifs et les valeurs de l’organisation.</p><h2>Axes de travail possibles</h2><ul><li>Posture managériale et communication</li><li>Décision dans des contextes complexes</li><li>Mobilisation et responsabilisation des équipes</li><li>Retours d’expérience et plan de progression</li></ul>',
                'tagline' => 'Renforcer sa posture pour mieux décider et mobiliser.',
                'ideal_for' => ['Prendre une nouvelle responsabilité', 'Faire évoluer sa posture managériale', 'Mobiliser une équipe autour d’un cap'],
                'featured_note' => 'La démarche alterne apports, pratique et retours d’expérience.',
            ],
            [
                'name' => 'Accompagnement entrepreneurial',
                'slug' => 'accompagnement-entrepreneurial',
                'icon' => 'briefcase',
                'excerpt' => 'Un appui structuré pour clarifier un projet, évaluer les priorités et préparer les prochaines décisions.',
                'content' => '<p>L’accompagnement entrepreneurial aide les porteurs de projet et dirigeants de PME à prendre du recul sur leur situation et à organiser leurs décisions.</p><h2>Passer de l’idée à une démarche structurée</h2><p>Le travail porte sur les hypothèses du projet, les besoins des bénéficiaires, les ressources disponibles et les actions prioritaires. Il ne remplace pas une expertise juridique ou financière spécialisée, mais fournit un cadre de réflexion et de suivi.</p><h2>Axes de travail possibles</h2><ul><li>Clarification de la proposition de valeur</li><li>Priorisation des actions et des ressources</li><li>Préparation d’une feuille de route</li><li>Suivi des apprentissages et ajustements</li></ul>',
                'tagline' => 'Structurer le projet et éclairer les prochaines décisions.',
                'ideal_for' => ['Clarifier une idée ou une offre', 'Prioriser les prochaines actions', 'Prendre du recul sur une décision'],
                'featured_note' => 'L’accompagnement complète, sans remplacer, les expertises spécialisées nécessaires.',
            ],
            [
                'name' => 'Bilan de compétences',
                'slug' => 'bilan-de-competences',
                'icon' => 'clipboardList',
                'excerpt' => 'Faites le point sur votre parcours, vos compétences et les pistes cohérentes avec vos priorités.',
                'content' => '<p>Le bilan de compétences propose une démarche guidée pour relire son parcours, identifier ses acquis et explorer des orientations professionnelles réalistes.</p><h2>Construire une vision plus claire</h2><p>À partir d’échanges, de ressources et d’outils d’analyse, vous rassemblez les éléments utiles pour mieux comprendre vos motivations, vos compétences transférables et les environnements qui vous correspondent.</p><h2>Axes de travail possibles</h2><ul><li>Analyse du parcours et des expériences</li><li>Identification des compétences et motivations</li><li>Exploration de pistes professionnelles</li><li>Formalisation d’un plan d’action</li></ul>',
                'tagline' => 'Relire son parcours pour construire la prochaine étape.',
                'ideal_for' => ['Identifier vos compétences transférables', 'Explorer une évolution professionnelle', 'Structurer un plan d’action'],
                'featured_note' => 'La démarche s’appuie sur vos expériences et des outils de réflexion guidée.',
            ],
            [
                'name' => 'Conférences et ateliers',
                'slug' => 'conferences-workshops',
                'icon' => 'mic2',
                'excerpt' => 'Des conférences, ateliers et webinaires conçus pour sensibiliser, transmettre et faire participer.',
                'content' => '<p>Les conférences et ateliers proposent un temps collectif autour d’un thème défini avec l’organisation : leadership, communication, coopération, transformation ou développement professionnel.</p><h2>Un format adapté au contexte</h2><p>L’intervention peut prendre la forme d’une conférence, d’un atelier participatif ou d’un webinaire. Le contenu, la durée et les activités sont précisés selon le public, les objectifs et les contraintes de l’événement.</p><h2>Formats possibles</h2><ul><li>Conférence thématique</li><li>Atelier de formation participatif</li><li>Webinaire à distance</li><li>Temps de réflexion pour une équipe ou un réseau</li></ul>',
                'tagline' => 'Partager des repères et ouvrir un espace de réflexion collective.',
                'ideal_for' => ['Sensibiliser un public à un enjeu', 'Animer un temps collectif', 'Proposer un atelier ou un webinaire'],
                'featured_note' => 'Le format est défini avec l’organisation selon le public et l’objectif.',
            ],
        ];

        foreach ($services as $data) {
            Service::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    ...$data,
                    'status' => true,
                    'user_id' => $admin?->id,
                    'cta_primary_label' => 'Faire une demande',
                    'cta_secondary_label' => 'Découvrir le service',
                ]
            );
        }
    }
}
