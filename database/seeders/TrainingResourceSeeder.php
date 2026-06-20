<?php

namespace Database\Seeders;

use App\Models\TrainingLesson;
use App\Models\TrainingResource;
use Illuminate\Database\Seeder;

class TrainingResourceSeeder extends Seeder
{
    public function run(): void
    {
        $lessons = TrainingLesson::query()
            ->where('is_published', true)
            ->orderBy('id')
            ->get();

        if ($lessons->isEmpty()) {
            $this->command?->warn('Aucune lecon trouvee. Lancez TrainingLessonSeeder avant TrainingResourceSeeder.');

            return;
        }

        foreach ($lessons as $lesson) {
            TrainingResource::updateOrCreate(
                [
                    'training_lesson_id' => $lesson->id,
                    'title' => 'Guide de la lecon',
                ],
                [
                    'description' => 'Document de support pour suivre la lecon pas a pas.',
                    'external_url' => 'https://www.learnenough.com/sample.pdf',
                    'file_type' => 'pdf',
                    'is_downloadable' => true,
                    'is_public' => false,
                    'sort_order' => 1,
                ]
            );

            TrainingResource::updateOrCreate(
                [
                    'training_lesson_id' => $lesson->id,
                    'title' => 'Checklist de progression',
                ],
                [
                    'description' => 'Checklist pour valider les acquis de la lecon.',
                    'external_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'file_type' => 'pdf',
                    'is_downloadable' => true,
                    'is_public' => false,
                    'sort_order' => 2,
                ]
            );
        }

        $this->command?->info('Ressources générées pour ' . $lessons->count() . ' leçon(s).');
    }
}