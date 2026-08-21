<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingQuizQuestion;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class TrainingJsonUpdatePlanner
{
    private const ACTIONS = ['CREATE', 'UPDATE', 'UNCHANGED', 'PRESERVE', 'AMBIGUOUS'];

    private const FIELDS = [
        'training_fields' => ['title', 'excerpt', 'content', 'start_date', 'end_date', 'location', 'featured_image', 'max_participants', 'price', 'is_published', 'is_featured', 'published_at', 'tags', 'meeting_link'],
        'sections' => ['title', 'description', 'sort_order', 'is_published'],
        'lessons' => ['title', 'slug', 'excerpt', 'content', 'video_url', 'video_duration', 'thumbnail', 'sort_order', 'is_free', 'is_published'],
        'resources' => ['title', 'description', 'file_path', 'external_url', 'file_disk', 'file_type', 'is_downloadable', 'is_public', 'sort_order'],
        'quizzes' => ['title', 'description', 'passing_score', 'is_published'],
        'questions' => ['question', 'options', 'correct_option_index', 'sort_order', 'points'],
    ];

    private array $summary = [];

    public function plan(array $package): array
    {
        $data = $package['data'] ?? null;
        if (! is_array($data) || ! is_string($data['slug'] ?? null)) {
            throw new InvalidArgumentException('Un export de formation valide est requis pour construire le plan.');
        }

        $training = Training::query()
            ->with(['sections.lessons.resources', 'sections.quiz.questions'])
            ->where('slug', $data['slug'])
            ->first();
        if (! $training) {
            throw new InvalidArgumentException('La formation cible du plan est introuvable.');
        }

        $this->summary = collect(array_keys(self::FIELDS))
            ->mapWithKeys(fn (string $scope) => [$scope => array_fill_keys(self::ACTIONS, 0)])
            ->all();

        $trainingChanges = $this->changes($data, $training, self::FIELDS['training_fields']);
        $trainingAction = $trainingChanges === [] ? 'UNCHANGED' : 'UPDATE';
        $this->count('training_fields', $trainingAction, max(1, count($trainingChanges)));

        $sections = $this->sections($data['sections'] ?? [], $training);
        $totals = array_fill_keys(self::ACTIONS, 0);
        foreach ($this->summary as $counts) {
            foreach ($counts as $action => $count) {
                $totals[$action] += $count;
            }
        }

        return [
            'mode' => 'update_plan',
            'training' => [
                'slug' => $training->slug,
                'action' => $trainingAction,
                'changes' => $trainingChanges,
            ],
            'content' => ['sections' => $sections],
            'summary' => [
                'by_scope' => $this->summary,
                'creates' => $totals['CREATE'],
                'updates' => $totals['UPDATE'],
                'unchanged' => $totals['UNCHANGED'],
                'preserved' => $totals['PRESERVE'],
                'ambiguous' => $totals['AMBIGUOUS'],
            ],
            'can_apply' => $totals['AMBIGUOUS'] === 0,
            'read_only' => true,
        ];
    }

    private function sections(array $incomingSections, Training $training): array
    {
        $nodes = [];
        $matched = [];
        foreach ($incomingSections as $incoming) {
            if (! empty($incoming['stable_id'])) {
                $candidate = TrainingSection::query()->where('stable_id', $incoming['stable_id'])->first();
                if ($candidate && $candidate->training_id !== $training->id) {
                    $nodes[] = $this->node('sections', 'AMBIGUOUS', $incoming['title'], [], [
                        'stable_id' => $incoming['stable_id'],
                        'reason' => 'Cet identifiant stable appartient à une autre formation.',
                    ]);

                    continue;
                }
                $candidates = collect($candidate ? [$training->sections->firstWhere('id', $candidate->id)] : []);
            } else {
                $titleCandidates = $training->sections->where('title', $incoming['title']);
                $exact = $titleCandidates->where('sort_order', $incoming['sort_order'] ?? 0);
                $candidates = $exact->isNotEmpty() ? $exact : $titleCandidates;
            }
            if ($candidates->count() > 1) {
                foreach ($candidates as $candidate) {
                    $matched[$candidate->id] = true;
                }
                $nodes[] = $this->node('sections', 'AMBIGUOUS', $incoming['title'], [], [
                    'stable_id' => $incoming['stable_id'] ?? null,
                    'reason' => 'Plusieurs sections correspondent au titre et à l’ordre disponibles.',
                ]);

                continue;
            }
            $section = $candidates->first();
            if (! $section) {
                $nodes[] = $this->createSection($incoming);

                continue;
            }
            $matched[$section->id] = true;
            $changes = $this->changes($incoming, $section, self::FIELDS['sections']);
            $nodes[] = $this->node('sections', $changes === [] ? 'UNCHANGED' : 'UPDATE', $incoming['title'], $changes, [
                'stable_id' => $section->stable_id,
                'lessons' => $this->lessons($incoming['lessons'] ?? [], $training, $section),
                'quiz' => $this->quiz($incoming['quiz'] ?? null, $section),
            ]);
        }
        foreach ($training->sections as $section) {
            if (! isset($matched[$section->id])) {
                $nodes[] = $this->preserveSection($section);
            }
        }

        return $nodes;
    }

    private function lessons(array $incomingLessons, Training $training, object $section): array
    {
        $nodes = [];
        $matched = [];
        $allLessons = $training->sections->flatMap->lessons;
        foreach ($incomingLessons as $incoming) {
            $candidates = $allLessons->where('slug', $incoming['slug']);
            if ($candidates->count() > 1) {
                foreach ($candidates as $candidate) {
                    $matched[$candidate->id] = true;
                }
                $nodes[] = $this->node('lessons', 'AMBIGUOUS', $incoming['title'], [], ['reason' => 'Le slug de leçon correspond à plusieurs enregistrements.']);

                continue;
            }
            $lesson = $candidates->first();
            if (! $lesson) {
                $nodes[] = $this->createLesson($incoming);

                continue;
            }
            $matched[$lesson->id] = true;
            $changes = $this->changes($incoming, $lesson, self::FIELDS['lessons']);
            $nodes[] = $this->node('lessons', $changes === [] ? 'UNCHANGED' : 'UPDATE', $incoming['title'], $changes, [
                'resources' => $this->resources($incoming['resources'] ?? [], $lesson),
            ]);
        }
        foreach ($section->lessons as $lesson) {
            if (! isset($matched[$lesson->id])) {
                $nodes[] = $this->preserveLesson($lesson);
            }
        }

        return $nodes;
    }

    private function resources(array $incomingResources, object $lesson): array
    {
        $nodes = [];
        $matched = [];
        foreach ($incomingResources as $incoming) {
            if (! empty($incoming['stable_id'])) {
                $candidate = TrainingResource::query()->where('stable_id', $incoming['stable_id'])->first();
                if ($candidate && $candidate->training_lesson_id !== $lesson->id) {
                    $nodes[] = $this->node('resources', 'AMBIGUOUS', $incoming['title'], [], [
                        'stable_id' => $incoming['stable_id'],
                        'reason' => 'Cet identifiant stable appartient à une autre leçon.',
                    ]);

                    continue;
                }
                $candidates = collect($candidate ? [$lesson->resources->firstWhere('id', $candidate->id)] : []);
            } else {
                $titleCandidates = $lesson->resources->where('title', $incoming['title']);
                $exact = $titleCandidates->where('sort_order', $incoming['sort_order'] ?? 0);
                $candidates = $exact->isNotEmpty() ? $exact : $titleCandidates;
            }
            if ($candidates->count() > 1) {
                foreach ($candidates as $candidate) {
                    $matched[$candidate->id] = true;
                }
                $nodes[] = $this->node('resources', 'AMBIGUOUS', $incoming['title'], [], ['reason' => 'Plusieurs ressources correspondent dans la leçon.']);

                continue;
            }
            $resource = $candidates->first();
            if (! $resource) {
                $nodes[] = $this->node('resources', 'CREATE', $incoming['title'], [], [
                    'stable_id' => $incoming['stable_id'] ?? null,
                ]);

                continue;
            }
            $matched[$resource->id] = true;
            $changes = $this->changes($incoming, $resource, self::FIELDS['resources']);
            $nodes[] = $this->node('resources', $changes === [] ? 'UNCHANGED' : 'UPDATE', $incoming['title'], $changes, [
                'stable_id' => $resource->stable_id,
            ]);
        }
        foreach ($lesson->resources as $resource) {
            if (! isset($matched[$resource->id])) {
                $nodes[] = $this->node('resources', 'PRESERVE', $resource->title, [], ['reason' => $this->preserveReason()]);
            }
        }

        return $nodes;
    }

    private function quiz(?array $incoming, object $section): ?array
    {
        if ($incoming === null) {
            return $section->quiz ? $this->preserveQuiz($section->quiz) : null;
        }
        if (! $section->quiz) {
            return $this->createQuiz($incoming);
        }
        $changes = $this->changes($incoming, $section->quiz, self::FIELDS['quizzes']);

        return $this->node('quizzes', $changes === [] ? 'UNCHANGED' : 'UPDATE', $incoming['title'], $changes, [
            'questions' => $this->questions($incoming['questions'] ?? [], $section->quiz),
        ]);
    }

    private function questions(array $incomingQuestions, object $quiz): array
    {
        $nodes = [];
        $matched = [];
        foreach ($incomingQuestions as $incoming) {
            if (! empty($incoming['stable_id'])) {
                $candidate = TrainingQuizQuestion::query()->where('stable_id', $incoming['stable_id'])->first();
                if ($candidate && $candidate->training_quiz_id !== $quiz->id) {
                    $nodes[] = $this->node('questions', 'AMBIGUOUS', $incoming['question'], [], [
                        'stable_id' => $incoming['stable_id'],
                        'reason' => 'Cet identifiant stable appartient à un autre quiz.',
                    ]);

                    continue;
                }
                $candidates = collect($candidate ? [$quiz->questions->firstWhere('id', $candidate->id)] : []);
            } else {
                $textCandidates = $quiz->questions->where('question', $incoming['question']);
                $exact = $textCandidates->where('sort_order', $incoming['sort_order'] ?? 0);
                $candidates = $exact->isNotEmpty() ? $exact : $textCandidates;
            }
            if ($candidates->count() > 1) {
                foreach ($candidates as $candidate) {
                    $matched[$candidate->id] = true;
                }
                $nodes[] = $this->node('questions', 'AMBIGUOUS', $incoming['question'], [], ['reason' => 'Plusieurs questions correspondent au texte et à l’ordre disponibles.']);

                continue;
            }
            $question = $candidates->first();
            if (! $question) {
                $nodes[] = $this->node('questions', 'CREATE', $incoming['question'], [], [
                    'stable_id' => $incoming['stable_id'] ?? null,
                ]);

                continue;
            }
            $matched[$question->id] = true;
            $changes = $this->changes($incoming, $question, self::FIELDS['questions']);
            $nodes[] = $this->node('questions', $changes === [] ? 'UNCHANGED' : 'UPDATE', $incoming['question'], $changes, [
                'stable_id' => $question->stable_id,
            ]);
        }
        foreach ($quiz->questions as $question) {
            if (! isset($matched[$question->id])) {
                $nodes[] = $this->node('questions', 'PRESERVE', $question->question, [], ['reason' => $this->preserveReason()]);
            }
        }

        return $nodes;
    }

    private function createSection(array $section): array
    {
        return $this->node('sections', 'CREATE', $section['title'], [], [
            'stable_id' => $section['stable_id'] ?? null,
            'lessons' => array_map(fn (array $lesson) => $this->createLesson($lesson), $section['lessons'] ?? []),
            'quiz' => ! empty($section['quiz']) ? $this->createQuiz($section['quiz']) : null,
        ]);
    }

    private function createLesson(array $lesson): array
    {
        return $this->node('lessons', 'CREATE', $lesson['title'], [], [
            'resources' => array_map(fn (array $resource) => $this->node('resources', 'CREATE', $resource['title'], [], [
                'stable_id' => $resource['stable_id'] ?? null,
            ]), $lesson['resources'] ?? []),
        ]);
    }

    private function createQuiz(array $quiz): array
    {
        return $this->node('quizzes', 'CREATE', $quiz['title'], [], [
            'questions' => array_map(fn (array $question) => $this->node('questions', 'CREATE', $question['question'], [], [
                'stable_id' => $question['stable_id'] ?? null,
            ]), $quiz['questions'] ?? []),
        ]);
    }

    private function preserveSection(object $section): array
    {
        return $this->node('sections', 'PRESERVE', $section->title, [], [
            'reason' => $this->preserveReason(),
            'lessons' => $section->lessons->map(fn ($lesson) => $this->preserveLesson($lesson))->all(),
            'quiz' => $section->quiz ? $this->preserveQuiz($section->quiz) : null,
        ]);
    }

    private function preserveLesson(object $lesson): array
    {
        return $this->node('lessons', 'PRESERVE', $lesson->title, [], [
            'reason' => $this->preserveReason(),
            'resources' => $lesson->resources->map(fn ($resource) => $this->node('resources', 'PRESERVE', $resource->title, [], ['reason' => $this->preserveReason()]))->all(),
        ]);
    }

    private function preserveQuiz(object $quiz): array
    {
        return $this->node('quizzes', 'PRESERVE', $quiz->title, [], [
            'reason' => $this->preserveReason(),
            'questions' => $quiz->questions->map(fn ($question) => $this->node('questions', 'PRESERVE', $question->question, [], ['reason' => $this->preserveReason()]))->all(),
        ]);
    }

    private function node(string $scope, string $action, string $label, array $changes = [], array $extra = []): array
    {
        $this->count($scope, $action);

        return ['action' => $action, 'label' => $label, 'changes' => $changes, ...$extra];
    }

    private function changes(array $incoming, object $existing, array $fields): array
    {
        $changes = [];
        foreach ($fields as $field) {
            $before = $this->existingValue($existing, $field);
            $after = $incoming[$field] ?? null;
            if ($this->comparable($before, $field) !== $this->comparable($after, $field)) {
                $changes[] = ['field' => $field, 'action' => 'UPDATE', 'before' => $before, 'after' => $after];
            }
        }

        return $changes;
    }

    private function existingValue(object $model, string $field): mixed
    {
        if (in_array($field, ['featured_image', 'thumbnail'], true)) {
            $raw = $model->getRawOriginal($field);
            if (! is_string($raw)) {
                return $raw;
            }
            $decoded = json_decode($raw, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : $raw;
        }
        if (in_array($field, ['start_date', 'end_date', 'published_at'], true)) {
            return $model->{$field} ? Carbon::parse($model->{$field})->toIso8601String() : null;
        }

        return $model->{$field};
    }

    private function comparable(mixed $value, string $field): string
    {
        if ($field === 'price' && is_numeric($value)) {
            return number_format((float) $value, 2, '.', '');
        }
        if (in_array($field, ['start_date', 'end_date', 'published_at'], true) && $value) {
            return Carbon::parse($value)->utc()->toIso8601String();
        }
        if (is_bool($value) || in_array($field, ['is_published', 'is_featured', 'is_free', 'is_downloadable', 'is_public'], true)) {
            return (string) (int) (bool) $value;
        }
        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return (string) ($value ?? '');
    }

    private function count(string $scope, string $action, int $amount = 1): void
    {
        $this->summary[$scope][$action] += $amount;
    }

    private function preserveReason(): string
    {
        return 'Présent sur l’environnement cible mais absent du JSON. Cet élément sera conservé.';
    }
}
