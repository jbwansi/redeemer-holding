<?php

namespace Database\Seeders;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TrainingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        
        // Get or create test users for participants
        $users = User::limit(5)->pluck('id')->toArray();
        
        $formationImages = [
            [
                'thumbnail' => 'trainings/69d43acc4c4fc_1775516364.jpg',
                'medium' => 'trainings/69d43acc4c4fc_1775516364.jpg',
                'large' => 'trainings/69d43acc4c4fc_1775516364.jpg',
                'original' => 'trainings/69d43acc4c4fc_1775516364.jpg',
                'banner' => 'trainings/69d43acc4c4fc_1775516364.jpg',
            ],
            [
                'thumbnail' => 'trainings/69d43b154e114_1775516437.jpg',
                'medium' => 'trainings/69d43b154e114_1775516437.jpg',
                'large' => 'trainings/69d43b154e114_1775516437.jpg',
                'original' => 'trainings/69d43b154e114_1775516437.jpg',
                'banner' => 'trainings/69d43b154e114_1775516437.jpg',
            ],
            [
                'thumbnail' => 'trainings/69d43b6b43263_1775516523.jpg',
                'medium' => 'trainings/69d43b6b43263_1775516523.jpg',
                'large' => 'trainings/69d43b6b43263_1775516523.jpg',
                'original' => 'trainings/69d43b6b43263_1775516523.jpg',
                'banner' => 'trainings/69d43b6b43263_1775516523.jpg',
            ],
            [
                'thumbnail' => 'trainings/69d43b9869a5d_1775516568.jpg',
                'medium' => 'trainings/69d43b9869a5d_1775516568.jpg',
                'large' => 'trainings/69d43b9869a5d_1775516568.jpg',
                'original' => 'trainings/69d43b9869a5d_1775516568.jpg',
                'banner' => 'trainings/69d43b9869a5d_1775516568.jpg',
            ],
            [
                'thumbnail' => 'trainings/69d43bca56g2w_1775516634.jpg',
                'medium' => 'trainings/69d43bca56g2w_1775516634.jpg',
                'large' => 'trainings/69d43bca56g2w_1775516634.jpg',
                'original' => 'trainings/69d43bca56g2w_1775516634.jpg',
                'banner' => 'trainings/69d43bca56g2w_1775516634.jpg',
            ],
        ];

        $trainings = [
            [
                'title'           => 'Programme Transformation 90 jours',
                'excerpt'         => 'Un programme complet sur 3 mois pour transformer durablement votre vie personnelle et professionnelle.',
                'content'         => '<p>Le Programme Transformation 90 jours est notre formation phare. En 12 semaines, vous construisez les fondations d\'une nouvelle version de vous-même.</p><h2>Ce que vous obtenez</h2><ul><li>1 session de coaching individuel par semaine</li><li>Accès à une communauté privée de participants</li><li>12 modules vidéo + ressources téléchargeables</li><li>Suivi personnalisé entre les sessions</li></ul><h2>Pour qui ?</h2><p>Ce programme s\'adresse à toute personne qui veut passer à l\'action, sortir de sa zone de confort et créer des changements durables.</p>',
                'location'        => 'En ligne + 2 journées en présentiel à Montréal',
                'start_date'      => now()->addDays(20)->setTime(9, 0),
                'end_date'        => now()->addDays(110)->setTime(17, 0),
                'price'           => 1497.00,
                'max_participants' => 15,
                'is_featured'     => true,
                'tags'            => ['transformation', 'coaching', 'programme intensif'],
                'meeting_link'    => 'https://zoom.us/j/demo-transformation',
                'featured_image'  => $formationImages[0],
            ],
            [
                'title'           => 'Training Leadership Authentique',
                'excerpt'         => 'Développez votre style de leadership unique et inspirez autour de vous. Training intensive sur 5 jours.',
                'content'         => '<p>Cette formation immersive s\'adresse aux managers et dirigeants qui veulent renforcer leur impact et leur légitimité.</p><h2>Programme</h2><ul><li>Jour 1 : Connaissance de soi et valeurs</li><li>Jour 2 : Communication et influence</li><li>Jour 3 : Gestion des conflits</li><li>Jour 4 : Délégation et responsabilisation</li><li>Jour 5 : Vision et projet de leadership</li></ul><h2>Compétences acquises</h2><ul><li>Développer un leadership authentique</li><li>Améliorer votre communication</li><li>Gérer efficacement les conflits</li><li>Inspirer et motiver vos équipes</li></ul>',
                'location'        => 'Montréal — Centre de formation',
                'start_date'      => now()->addDays(35)->setTime(9, 0),
                'end_date'        => now()->addDays(39)->setTime(17, 0),
                'price'           => 2500.00,
                'max_participants' => 10,
                'is_featured'     => false,
                'tags'            => ['leadership', 'management', 'formation'],
                'meeting_link'    => null,
                'featured_image'  => $formationImages[1],
            ],
            [
                'title'           => 'Atelier Communication Non Violente (CNV)',
                'excerpt'         => 'Apprenez à communiquer avec empathie et assertivité. Un outil transformateur pour vos relations pro et perso.',
                'content'         => '<p>La Communication Non Violente (CNV) est une approche développée par Marshall Rosenberg. Elle repose sur 4 étapes : Observation, Sentiment, Besoin, Demande.</p><p>Au cours de cette formation de 2 jours, vous intégrerez ces 4 étapes par la pratique, les jeux de rôle et les retours en groupe.</p><h2>Format</h2><ul><li>Ateliers interactifs</li><li>Exercices pratiques</li><li>Études de cas réels</li><li>Support de formation inclus</li></ul>',
                'location'        => 'Montréal — En présentiel',
                'start_date'      => now()->addDays(50)->setTime(9, 0),
                'end_date'        => now()->addDays(51)->setTime(17, 0),
                'price'           => 450.00,
                'max_participants' => 16,
                'is_featured'     => false,
                'tags'            => ['communication', 'CNV', 'relations'],
                'meeting_link'    => null,
                'featured_image'  => $formationImages[2],
            ],
            [
                'title'           => 'Masterclass Entrepreneuriat : Valider et Lancer',
                'excerpt'         => 'De l\'idée au premier client en 30 jours. Une masterclass intense pour les entrepreneurs en démarrage.',
                'content'         => '<p>Vous avez une idée de business mais vous ne savez pas par où commencer ? Cette masterclass intensive en ligne vous donne un cadre clair et des outils opérationnels pour valider votre concept et acquérir vos premiers clients.</p><h2>Contenu du programme</h2><ul><li>Valider votre idée de business</li><li>Analyser votre marché</li><li>Créer votre proposition de valeur</li><li>Acquérir vos premiers clients</li><li>Générer vos premiers revenus</li></ul>',
                'location'        => 'En ligne — Zoom',
                'start_date'      => now()->addDays(60)->setTime(9, 0),
                'end_date'        => now()->addDays(60)->setTime(18, 0),
                'price'           => 297.00,
                'max_participants' => null,
                'is_featured'     => false,
                'tags'            => ['entrepreneuriat', 'lancement', 'business'],
                'meeting_link'    => 'https://zoom.us/j/demo-entrepreneuriat',
                'featured_image'  => $formationImages[3],
            ],
            [
                'title'           => 'Formation E-Learning : Maîtriser le Digital',
                'excerpt'         => 'Apprenez les meilleures pratiques pour créer et animer des formations en ligne efficaces.',
                'content'         => '<p>Cette formation vous apprend comment créer du contenu pédagogique engageant pour l\'e-learning. Vous découvrirez les outils, les techniques et les stratégies utilisées par les meilleurs formateurs en ligne.</p><h2>Modules disponibles</h2><ul><li>Semaine 1 : Fondamentaux du e-learning</li><li>Semaine 2 : Créer du contenu vidéo</li><li>Semaine 3 : Conception pédagogique</li><li>Semaine 4 : Outils et plateformes</li><li>Semaine 5 : Animer et motiver les apprenants</li><li>Semaine 6 : Évaluation et feedback</li></ul><h2>Avantages</h2><ul><li>Accès illimité au contenu</li><li>Certificat de completion</li><li>Ressources téléchargeables</li><li>Support communautaire</li></ul>',
                'location'        => 'En ligne — Plateforme e-learning',
                'start_date'      => now()->subDays(10)->setTime(8, 0),
                'end_date'        => now()->addDays(40)->setTime(22, 0),
                'price'           => 699.00,
                'max_participants' => 25,
                'is_featured'     => true,
                'tags'            => ['e-learning', 'digital', 'formation en ligne', 'pédagogie'],
                'meeting_link'    => 'https://zoom.us/j/demo-elearning',
                'featured_image'  => $formationImages[4],
            ],
        ];

        // Create trainings
        $createdTrainings = [];
        foreach ($trainings as $data) {
            $slug = Str::slug($data['title']);

            $training = Training::updateOrCreate(
                ['slug' => $slug],
                [
                    'title'            => $data['title'],
                    'excerpt'          => $data['excerpt'],
                    'content'          => $data['content'],
                    'location'         => $data['location'],
                    'start_date'       => $data['start_date'],
                    'end_date'         => $data['end_date'],
                    'price'            => $data['price'],
                    'max_participants' => $data['max_participants'],
                    'featured_image'   => $data['featured_image'],
                    'is_featured'      => $data['is_featured'],
                    'is_published'     => true,
                    'published_at'     => now(),
                    'tags'             => $data['tags'],
                    'meeting_link'     => $data['meeting_link'],
                    'user_id'          => $admin->id,
                ]
            );
            
            $createdTrainings[$training->id] = [
                'slug' => $slug,
                'title' => $data['title'],
                'price' => $data['price'],
            ];
        }

        // Add participants to trainings with different statuses
        $participantNames = [
            ['name' => 'Alice Dupont', 'email' => 'alice.dupont@example.com', 'phone' => '+1-514-555-0101'],
            ['name' => 'Bob Martin', 'email' => 'bob.martin@example.com', 'phone' => '+1-514-555-0102'],
            ['name' => 'Caroline Leclerc', 'email' => 'caroline.leclerc@example.com', 'phone' => '+1-514-555-0103'],
            ['name' => 'David Johnson', 'email' => 'david.johnson@example.com', 'phone' => '+1-514-555-0104'],
            ['name' => 'Emma Wilson', 'email' => 'emma.wilson@example.com', 'phone' => '+1-514-555-0105'],
            ['name' => 'Frank Bernard', 'email' => 'frank.bernard@example.com', 'phone' => '+1-514-555-0106'],
            ['name' => 'Gabrielle Rousseau', 'email' => 'gabrielle.rousseau@example.com', 'phone' => '+1-514-555-0107'],
            ['name' => 'Henri Dubois', 'email' => 'henri.dubois@example.com', 'phone' => '+1-514-555-0108'],
        ];

        // For each training, add some participants
        foreach ($createdTrainings as $trainingId => $trainingData) {
            // Randomly assign participants to each training
            $numParticipants = rand(3, 7);
            $selectedParticipants = array_slice($participantNames, 0, $numParticipants);
            
            foreach ($selectedParticipants as $index => $participant) {
                $statuses = ['pending', 'in_progress', 'completed'];
                $status = $statuses[$index % count($statuses)];
                
                $reference = 'REF-' . strtoupper(uniqid());
                
                TrainingParticipant::updateOrCreate(
                    [
                        'training_id' => $trainingId,
                        'email' => $participant['email'],
                    ],
                    [
                        'name' => $participant['name'],
                        'email' => $participant['email'],
                        'phone' => $participant['phone'],
                        'status' => $status,
                        'reference' => $reference,
                        'qty' => 1,
                        'payment_amount' => $trainingData['price'],
                        'payment_confirmed' => $status !== 'pending',
                        'payment_date' => $status !== 'pending' ? now()->subDays(rand(1, 30)) : null,
                        'payment_id' => $status !== 'pending' ? 'DEMO-' . strtoupper(uniqid()) : null,
                    ]
                );
            }
        }
    }
}


