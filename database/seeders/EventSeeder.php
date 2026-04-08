<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $defaultEventImage = [
            'thumbnail' => 'events/69d440761ebec_1775517814.jpg',
            'medium' => 'events/69d440761ebec_1775517814.jpg',
            'large' => 'events/69d440761ebec_1775517814.jpg',
            'original' => 'events/69d440761ebec_1775517814.jpg',
            'banner' => 'events/69d440761ebec_1775517814.jpg',
        ];

        // Event categories
        $eventCategories = [
            ['name' => 'Conférence',    'color' => '#DA2E29', 'description' => 'Conférences et présentations'],
            ['name' => 'Atelier',       'color' => '#0f766e', 'description' => 'Ateliers pratiques et workshops'],
            ['name' => 'Masterclass',   'color' => '#7c3aed', 'description' => 'Masterclasses intensives'],
            ['name' => 'Networking',    'color' => '#d97706', 'description' => 'Événements de réseautage'],
        ];

        foreach ($eventCategories as $cat) {
            EventCategory::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                ['name' => $cat['name'], 'color' => $cat['color'], 'description' => $cat['description']]
            );
        }

        $conf  = EventCategory::where('name', 'Conférence')->first();
        $atel  = EventCategory::where('name', 'Atelier')->first();
        $mcl   = EventCategory::where('name', 'Masterclass')->first();
        $net   = EventCategory::where('name', 'Networking')->first();

        $events = [
            [
                'title'           => 'Conférence : L\'art du leadership en 2026',
                'category'        => $conf,
                'description'     => 'Une soirée de partage et d\'inspiration autour des nouvelles formes de leadership adaptées aux défis actuels.',
                'content'         => '<p>Le leadership a profondément évolué ces dernières années. Cette conférence explore les nouvelles compétences indispensables pour guider des équipes dans un monde incertain.</p><h2>Programme</h2><ul><li>18h00 : Accueil et networking</li><li>18h30 : Conférence principale</li><li>19h30 : Table ronde et questions</li><li>20h00 : Cocktail de clôture</li></ul>',
                'location'        => 'Montréal, Centre-ville — Salle Lumière',
                'start_date'      => now()->addDays(15)->setTime(18, 0),
                'end_date'        => now()->addDays(15)->setTime(20, 30),
                'price'           => 0,
                'max_participants' => 80,
                'is_featured'     => true,
                'tags'            => ['leadership', 'conférence', 'inspiration'],
                'featured_image'  => $defaultEventImage,
            ],
            [
                'title'           => 'Atelier : Prise de parole en public',
                'category'        => $atel,
                'description'     => 'Un atelier pratique en petit groupe pour maîtriser la prise de parole et gagner en confiance face à un auditoire.',
                'content'         => '<p>Au cours de cet atelier intensif de 3 heures, vous aurez l\'occasion de pratiquer en conditions réelles, de recevoir des retours bienveillants et de repartir avec des outils immédiatement applicables.</p><h2>Ce que vous allez apprendre</h2><ul><li>Structurer un discours impactant en 5 minutes</li><li>Gérer le stress et la voix</li><li>Captiver et retenir l\'attention</li><li>Utiliser le langage corporel</li></ul>',
                'location'        => 'Montréal — Studio Parole Libre',
                'start_date'      => now()->addDays(22)->setTime(9, 0),
                'end_date'        => now()->addDays(22)->setTime(12, 0),
                'price'           => 75.00,
                'max_participants' => 12,
                'is_featured'     => false,
                'tags'            => ['communication', 'atelier', 'prise de parole'],
                'featured_image'  => $defaultEventImage,
            ],
            [
                'title'           => 'Masterclass : Productivité et deep work',
                'category'        => $mcl,
                'description'     => 'Une masterclass d\'une journée pour reprogrammer votre rapport au temps et produire des résultats extraordinaires.',
                'content'         => '<p>Basée sur les recherches de Cal Newport et les expériences de terrain, cette masterclass vous donne un système complet pour atteindre un niveau de productivité que vous n\'aviez jamais atteint.</p>',
                'location'        => 'En ligne — Zoom',
                'start_date'      => now()->addDays(30)->setTime(9, 0),
                'end_date'        => now()->addDays(30)->setTime(17, 0),
                'price'           => 149.00,
                'max_participants' => 30,
                'is_featured'     => false,
                'tags'            => ['productivité', 'masterclass', 'deep work'],
                'featured_image'  => $defaultEventImage,
            ],
            [
                'title'           => 'Soirée Networking : Entrepreneurs & Coachs',
                'category'        => $net,
                'description'     => 'Une soirée dédiée aux connexions authentiques entre entrepreneurs, coachs et professionnels du développement.',
                'content'         => '<p>Rejoignez une communauté engagée pour une soirée de réseautage de qualité. Pas de pitch commercial, juste des échanges vrais et des connexions durables.</p>',
                'location'        => 'Montréal — Le Social Hub',
                'start_date'      => now()->addDays(45)->setTime(18, 30),
                'end_date'        => now()->addDays(45)->setTime(21, 0),
                'price'           => 20.00,
                'max_participants' => 50,
                'is_featured'     => false,
                'tags'            => ['networking', 'entrepreneuriat', 'communauté'],
                'featured_image'  => $defaultEventImage,
            ],
        ];

        foreach ($events as $data) {
            $slug = Str::slug($data['title']);

            Event::updateOrCreate(
                ['slug' => $slug],
                [
                    'title'            => $data['title'],
                    'category_id'      => $data['category']->id,
                    'user_id'          => $admin->id,
                    'description'      => $data['description'],
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
                ]
            );
        }
    }
}
