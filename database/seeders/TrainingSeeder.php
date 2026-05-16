<?php

namespace Database\Seeders;

use App\Models\Training;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TrainingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
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
                'content'         => '<p>Cette formation immersive s\'adresse aux managers et dirigeants qui veulent renforcer leur impact et leur légitimité.</p><h2>Programme</h2><p>Jour 1 : Connaissance de soi et valeurs</p><p>Jour 2 : Communication et influence</p><p>Jour 3 : Gestion des conflits</p><p>Jour 4 : Délégation et responsabilisation</p><p>Jour 5 : Vision et projet de leadership</p>',
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
                'content'         => '<p>La Communication Non Violente (CNV) est une approche développée par Marshall Rosenberg. Elle repose sur 4 étapes : Observation, Sentiment, Besoin, Demande.</p><p>Au cours de cette formation de 2 jours, vous intégrerez ces 4 étapes par la pratique, les jeux de rôle et les retours en groupe.</p>',
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
                'content'         => '<p>Vous avez une idée de business mais vous ne savez pas par où commencer ? Cette masterclass intensive en ligne vous donne un cadre clair et des outils opérationnels pour valider votre concept et acquérir vos premiers clients.</p>',
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
        ];

        foreach ($trainings as $data) {
            $slug = Str::slug($data['title']);

            Training::updateOrCreate(
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
        }
    }
}


