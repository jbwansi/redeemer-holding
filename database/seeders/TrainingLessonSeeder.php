<?php

namespace Database\Seeders;

use App\Models\Training;
use App\Models\TrainingSection;
use App\Models\TrainingLesson;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TrainingLessonSeeder extends Seeder
{
    public function run(): void
    {
        $trainings = Training::query()->get();

        if ($trainings->isEmpty()) {
            $this->command?->warn('Aucune formation trouvée. Lancez TrainingSeeder avant TrainingLessonSeeder.');
            return;
        }

        $modules = [
            [
                'title' => 'Module 1 : Introduction',
                'description' => 'Découverte du programme et des objectifs.',
                'sort_order' => 1,
                'lessons' => [
                    [
                        'title' => 'Bienvenue dans la formation',
                        'excerpt' => 'Présentation générale de la formation.',
                        'content' => '<h2>Bienvenue</h2><p>Dans cette leçon, nous découvrons le programme et les objectifs.</p>',
                        'video_url' => 'https://www.youtube.com/watch?v=1',
                        'sort_order' => 1,
                    ],
                    [
                        'title' => 'Comment suivre le programme',
                        'excerpt' => 'Méthode pour bien progresser.',
                        'content' => '<h2>Méthode</h2><p>Organisez votre temps et avancez étape par étape.</p>',
                        'video_url' => 'https://www.youtube.com/watch?v=2',
                        'sort_order' => 2,
                    ],
                ],
            ],
            [
                'title' => 'Module 2 : Développement personnel',
                'description' => 'Comprendre ses valeurs et ses objectifs.',
                'sort_order' => 2,
                'lessons' => [
                    [
                        'title' => 'Identifier ses valeurs',
                        'excerpt' => 'Exercice pour clarifier ses valeurs.',
                        'content' => '<h2>Vos valeurs</h2><p>Identifiez les principes qui guident vos décisions.</p>',
                        'video_url' => 'https://www.youtube.com/watch?v=3',
                        'sort_order' => 1,
                    ],
                    [
                        'title' => 'Définir ses objectifs',
                        'excerpt' => 'Transformer une vision en objectifs concrets.',
                        'content' => '<h2>Objectifs</h2><p>Apprenez à définir des objectifs clairs et mesurables.</p>',
                        'video_url' => 'https://www.youtube.com/watch?v=4',
                        'sort_order' => 2,
                    ],
                ],
            ],
            [
                'title' => 'Module 3 : Mise en pratique',
                'description' => 'Passer à l’action avec un plan concret.',
                'sort_order' => 3,
                'lessons' => [
                    [
                        'title' => 'Créer son plan d’action',
                        'excerpt' => 'Construire un plan simple et applicable.',
                        'content' => '<h2>Plan d’action</h2><p>Définissez vos prochaines étapes pour avancer concrètement.</p>',
                        'video_url' => 'https://www.youtube.com/watch?v=5',
                        'sort_order' => 1,
                    ],
                ],
            ],
        ];

        foreach ($trainings as $training) {
            foreach ($modules as $moduleData) {
                $section = TrainingSection::updateOrCreate(
                    [
                        'training_id' => $training->id,
                        'title' => $moduleData['title'],
                    ],
                    [
                        'description' => $moduleData['description'],
                        'sort_order' => $moduleData['sort_order'],
                        'is_published' => true,
                    ]
                );

                foreach ($moduleData['lessons'] as $lessonData) {
                    $slug = Str::slug($lessonData['title'] . '-' . $training->id);

                    TrainingLesson::updateOrCreate(
                        [
                            'training_id' => $training->id,
                            'slug' => $slug,
                        ],
                        [
                            'training_section_id' => $section->id,
                            'title' => $lessonData['title'],
                            'excerpt' => $lessonData['excerpt'],
                            'content' => $lessonData['content'],
                            'video_url' => $lessonData['video_url'],
                            'sort_order' => $lessonData['sort_order'],
                            'is_published' => true,
                        ]
                    );
                }
            }
        }

        $this->command?->info('Modules et leçons générés pour ' . $trainings->count() . ' formation(s).');
    }
}