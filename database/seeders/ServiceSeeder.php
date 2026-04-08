<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $services = [
            [
                'name'    => 'Coaching individuel',
                'icon'    => 'userRound',
                'excerpt' => 'Un accompagnement personnalisé pour atteindre vos objectifs de vie et de carrière.',
                'content' => '<p>Le coaching individuel est un partenariat entre vous et votre coach, centré sur vos objectifs, vos blocages et votre potentiel. Chaque session est unique, adaptée à votre réalité du moment.</p><h2>Ce que vous obtenez</h2><ul><li>Clarté sur vos objectifs prioritaires</li><li>Un plan d\'action concret et réaliste</li><li>Un soutien bienveillant et exigeant</li><li>Des outils pratiques entre les sessions</li></ul>',
            ],
            [
                'name'    => 'Coaching d\'équipe',
                'icon'    => 'users',
                'excerpt' => 'Transformez votre équipe en une unité performante et soudée autour d\'une vision commune.',
                'content' => '<p>Le coaching d\'équipe s\'adresse aux groupes qui souhaitent améliorer leur cohésion, leur communication et leur performance collective. Idéal pour les équipes en croissance ou en transition.</p>',
            ],
            [
                'name'    => 'Développement du leadership',
                'icon'    => 'trophy',
                'excerpt' => 'Révélez le leader qui sommeille en vous. Programme intensif sur 3 mois.',
                'content' => '<p>Ce programme s\'adresse aux managers, dirigeants et entrepreneurs qui veulent passer au niveau supérieur. Il combine sessions individuelles, ateliers de groupe et missions terrain.</p>',
            ],
            [
                'name'    => 'Accompagnement entrepreneurial',
                'icon'    => 'briefcase',
                'excerpt' => 'De l\'idée au lancement : un accompagnement structuré pour les entrepreneurs ambitieux.',
                'content' => '<p>Vous avez une idée, une vision, l\'envie d\'entreprendre. Ce service vous aide à structurer votre projet, valider votre marché et passer à l\'action avec confiance.</p>',
            ],
            [
                'name'    => 'Bilan de compétences',
                'icon'    => 'clipboardList',
                'excerpt' => 'Faites le point sur votre parcours, vos forces et vos prochaines étapes professionnelles.',
                'content' => '<p>Le bilan de compétences vous permet de prendre du recul sur votre carrière, d\'identifier vos atouts et de définir un projet professionnel aligné avec vos valeurs.</p>',
            ],
            [
                'name'    => 'Conférences & Workshops',
                'icon'    => 'mic2',
                'excerpt' => 'Des interventions percutantes pour vos équipes, événements d\'entreprise et congrès.',
                'content' => '<p>Des conférences inspirantes et des ateliers pratiques sur les thèmes du leadership, de la résilience, de la communication et de la performance. Adaptés à vos besoins spécifiques.</p>',
            ],
        ];

        foreach ($services as $data) {
            $slug = Str::slug($data['name']);
            if (Service::where('slug', $slug)->exists()) {
                continue;
            }

            Service::create([
                'name'    => $data['name'],
                'slug'    => $slug,
                'icon'    => $data['icon'],
                'excerpt' => $data['excerpt'],
                'content' => $data['content'],
                'status'  => true,
                'user_id' => $admin->id,
            ]);
        }
    }
}
