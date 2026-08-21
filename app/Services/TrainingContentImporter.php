<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingQuiz;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use InvalidArgumentException;

class TrainingContentImporter
{
    public function import(Training $training, array $sections): array
    {
        $this->assertStableIdsAvailable($sections);
        $counts = ['sections' => 0, 'lessons' => 0, 'resources' => 0, 'quizzes' => 0, 'questions' => 0];

        foreach ($sections as $sectionData) {
            $section = TrainingSection::create([
                'training_id' => $training->id,
                'stable_id' => $sectionData['stable_id'] ?? null,
                'title' => $sectionData['title'],
                'description' => $sectionData['description'] ?? null,
                'sort_order' => (int) ($sectionData['sort_order'] ?? 0),
                'is_published' => (bool) ($sectionData['is_published'] ?? true),
            ]);
            $counts['sections']++;

            foreach ($sectionData['lessons'] ?? [] as $lessonData) {
                $lesson = TrainingLesson::create([
                    'training_id' => $training->id,
                    'training_section_id' => $section->id,
                    'title' => $lessonData['title'],
                    'slug' => $lessonData['slug'],
                    'excerpt' => $lessonData['excerpt'] ?? null,
                    'content' => $lessonData['content'] ?? null,
                    'video_url' => $lessonData['video_url'] ?? null,
                    'video_duration' => $lessonData['video_duration'] ?? null,
                    'thumbnail' => $this->jsonColumn($lessonData['thumbnail'] ?? null),
                    'sort_order' => (int) ($lessonData['sort_order'] ?? 0),
                    'is_free' => (bool) ($lessonData['is_free'] ?? false),
                    'is_published' => (bool) ($lessonData['is_published'] ?? true),
                ]);
                $counts['lessons']++;

                foreach ($lessonData['resources'] ?? [] as $resourceData) {
                    TrainingResource::create([
                        'training_lesson_id' => $lesson->id,
                        'stable_id' => $resourceData['stable_id'] ?? null,
                        'title' => $resourceData['title'],
                        'description' => $resourceData['description'] ?? null,
                        'file_path' => $resourceData['file_path'] ?? null,
                        'external_url' => $resourceData['external_url'] ?? null,
                        'file_disk' => $resourceData['file_disk'] ?? 'public',
                        'file_type' => $resourceData['file_type'] ?? null,
                        'is_downloadable' => (bool) ($resourceData['is_downloadable'] ?? true),
                        'is_public' => (bool) ($resourceData['is_public'] ?? false),
                        'sort_order' => (int) ($resourceData['sort_order'] ?? 0),
                    ]);
                    $counts['resources']++;
                }
            }

            if (! empty($sectionData['quiz'])) {
                $quizData = $sectionData['quiz'];
                $quiz = TrainingQuiz::create([
                    'training_id' => $training->id,
                    'training_section_id' => $section->id,
                    'title' => $quizData['title'],
                    'description' => $quizData['description'] ?? null,
                    'passing_score' => (int) ($quizData['passing_score'] ?? 70),
                    'is_published' => (bool) ($quizData['is_published'] ?? false),
                ]);
                $counts['quizzes']++;

                foreach ($quizData['questions'] ?? [] as $questionData) {
                    $options = $questionData['options'] ?? [];
                    $correctIndex = $questionData['correct_option_index'] ?? null;
                    if (! is_int($correctIndex) || ! array_key_exists($correctIndex, $options)) {
                        throw new InvalidArgumentException('Une question de quiz contient une bonne réponse invalide.');
                    }
                    $quiz->questions()->create([
                        'stable_id' => $questionData['stable_id'] ?? null,
                        'question' => $questionData['question'],
                        'options' => $options,
                        'correct_option_index' => $correctIndex,
                        'sort_order' => (int) ($questionData['sort_order'] ?? 0),
                        'points' => (int) ($questionData['points'] ?? 1),
                    ]);
                    $counts['questions']++;
                }
            }
        }

        return $counts;
    }

    private function jsonColumn(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_string($value)
            ? $value
            : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    private function assertStableIdsAvailable(array $sections): void
    {
        $ids = ['sections' => [], 'resources' => [], 'questions' => []];
        foreach ($sections as $section) {
            if (! empty($section['stable_id'])) {
                $ids['sections'][] = $section['stable_id'];
            }
            foreach ($section['lessons'] ?? [] as $lesson) {
                foreach ($lesson['resources'] ?? [] as $resource) {
                    if (! empty($resource['stable_id'])) {
                        $ids['resources'][] = $resource['stable_id'];
                    }
                }
            }
            foreach ($section['quiz']['questions'] ?? [] as $question) {
                if (! empty($question['stable_id'])) {
                    $ids['questions'][] = $question['stable_id'];
                }
            }
        }

        $models = [
            'sections' => TrainingSection::class,
            'resources' => TrainingResource::class,
            'questions' => \App\Models\TrainingQuizQuestion::class,
        ];
        foreach ($ids as $type => $values) {
            if (count($values) !== count(array_unique($values))
                || ($values !== [] && $models[$type]::query()->whereIn('stable_id', $values)->exists())) {
                throw new InvalidArgumentException('Un identifiant stable de contenu est déjà utilisé ou dupliqué.');
            }
        }
    }
}
