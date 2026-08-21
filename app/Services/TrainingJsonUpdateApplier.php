<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizQuestion;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class TrainingJsonUpdateApplier
{
    private const TRAINING_FIELDS = [
        'title', 'excerpt', 'content', 'start_date', 'end_date', 'location', 'featured_image',
        'max_participants', 'price', 'is_published', 'is_featured', 'published_at', 'tags',
        'meeting_link',
    ];

    private const SECTION_FIELDS = ['title', 'description', 'sort_order', 'is_published'];

    private const LESSON_FIELDS = [
        'title', 'excerpt', 'content', 'video_url', 'video_duration', 'thumbnail', 'sort_order',
        'is_free', 'is_published',
    ];

    private const RESOURCE_FIELDS = [
        'title', 'description', 'file_path', 'external_url', 'file_disk', 'file_type',
        'is_downloadable', 'is_public', 'sort_order',
    ];

    private const QUIZ_FIELDS = ['title', 'description', 'passing_score', 'is_published'];

    private const QUESTION_FIELDS = ['question', 'options', 'correct_option_index', 'sort_order', 'points'];

    public function __construct(
        private readonly TrainingJsonImportAnalyzer $analyzer,
        private readonly TrainingJsonUpdatePlanner $planner,
    ) {}

    public function apply(string $json, string $filename = ''): array
    {
        $analysis = $this->analyzer->analyze($json, $filename);
        if (! $analysis['valid']) {
            throw ValidationException::withMessages(['file' => $analysis['errors']]);
        }
        if ($analysis['status'] !== 'existing') {
            throw new DomainException('Le fichier doit cibler une formation existante.');
        }

        $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $data = $package['data'];
        $this->validateQuestions($data['sections'] ?? []);

        return DB::transaction(function () use ($data): array {
            $training = Training::query()
                ->where('slug', $data['slug'])
                ->lockForUpdate()
                ->first();
            if (! $training || $training->slug !== $data['slug']) {
                throw new DomainException('La formation cible ne correspond plus au JSON.');
            }

            $plan = $this->planner->plan(['data' => $data]);
            if (! $plan['can_apply'] || $plan['summary']['ambiguous'] !== 0) {
                throw new DomainException('La mise à jour contient des correspondances ambiguës. Aucune donnée n’a été modifiée.');
            }

            $this->applyTraining($training, $data, $plan['training']);
            $this->applySections($training, $data['sections'] ?? [], $plan['content']['sections']);

            return $this->report($training->fresh(), $plan);
        });
    }

    private function applyTraining(Training $training, array $data, array $plan): void
    {
        if ($plan['action'] !== 'UPDATE') {
            return;
        }

        $training->update($this->changedValues($data, $plan, self::TRAINING_FIELDS));
    }

    private function applySections(Training $training, array $incoming, array $nodes): void
    {
        foreach ($incoming as $index => $data) {
            $node = $nodes[$index] ?? throw new DomainException('Le plan des sections est incohérent.');
            if ($node['action'] === 'CREATE') {
                $section = TrainingSection::create([
                    'training_id' => $training->id,
                    'stable_id' => $data['stable_id'] ?? null,
                    ...$this->only($data, self::SECTION_FIELDS),
                ]);
            } elseif (in_array($node['action'], ['UPDATE', 'UNCHANGED'], true)) {
                $section = $this->uniqueSection($training, $data);
                if ($node['action'] === 'UPDATE') {
                    $section->update($this->changedValues($data, $node, self::SECTION_FIELDS));
                }
            } else {
                throw new DomainException('Une action de section non applicable a été détectée.');
            }

            $this->applyLessons($training, $section, $data['lessons'] ?? [], $node['lessons'] ?? []);
            $this->applyQuiz($training, $section, $data['quiz'] ?? null, $node['quiz'] ?? null);
        }
    }

    private function applyLessons(Training $training, TrainingSection $section, array $incoming, array $nodes): void
    {
        foreach ($incoming as $index => $data) {
            $node = $nodes[$index] ?? throw new DomainException('Le plan des leçons est incohérent.');
            if ($node['action'] === 'CREATE') {
                if (TrainingLesson::query()->where('slug', $data['slug'])->exists()) {
                    throw new DomainException('Une collision de slug empêche la création d’une leçon.');
                }
                $lesson = TrainingLesson::create([
                    'training_id' => $training->id,
                    'training_section_id' => $section->id,
                    ...$this->lessonValues($data),
                    'slug' => $data['slug'],
                ]);
            } elseif (in_array($node['action'], ['UPDATE', 'UNCHANGED'], true)) {
                $lesson = $this->uniqueLesson($training, $section, $data['slug']);
                if ($node['action'] === 'UPDATE') {
                    $lesson->update($this->lessonValues($data, $node));
                }
            } else {
                throw new DomainException('Une action de leçon non applicable a été détectée.');
            }

            $this->applyResources($lesson, $data['resources'] ?? [], $node['resources'] ?? []);
        }
    }

    private function applyResources(TrainingLesson $lesson, array $incoming, array $nodes): void
    {
        foreach ($incoming as $index => $data) {
            $node = $nodes[$index] ?? throw new DomainException('Le plan des ressources est incohérent.');
            if ($node['action'] === 'CREATE') {
                TrainingResource::create([
                    'training_lesson_id' => $lesson->id,
                    'stable_id' => $data['stable_id'] ?? null,
                    ...$this->only($data, self::RESOURCE_FIELDS),
                ]);
            } elseif ($node['action'] === 'UPDATE') {
                $this->uniqueResource($lesson, $data)->update($this->changedValues($data, $node, self::RESOURCE_FIELDS));
            } elseif ($node['action'] !== 'UNCHANGED') {
                throw new DomainException('Une action de ressource non applicable a été détectée.');
            }
        }
    }

    private function applyQuiz(Training $training, TrainingSection $section, ?array $data, ?array $node): void
    {
        if ($data === null) {
            return;
        }
        if (! $node) {
            throw new DomainException('Le plan du quiz est incohérent.');
        }

        if ($node['action'] === 'CREATE') {
            if ($section->quiz()->exists()) {
                throw new DomainException('Un quiz existe déjà pour cette section.');
            }
            $quiz = TrainingQuiz::create([
                'training_id' => $training->id,
                'training_section_id' => $section->id,
                ...$this->only($data, self::QUIZ_FIELDS),
            ]);
        } elseif (in_array($node['action'], ['UPDATE', 'UNCHANGED'], true)) {
            $quiz = $section->quiz()->firstOrFail();
            if ($node['action'] === 'UPDATE') {
                $quiz->update($this->changedValues($data, $node, self::QUIZ_FIELDS));
            }
        } else {
            throw new DomainException('Une action de quiz non applicable a été détectée.');
        }

        $this->applyQuestions($quiz, $data['questions'] ?? [], $node['questions'] ?? []);
    }

    private function applyQuestions(TrainingQuiz $quiz, array $incoming, array $nodes): void
    {
        foreach ($incoming as $index => $data) {
            $node = $nodes[$index] ?? throw new DomainException('Le plan des questions est incohérent.');
            if ($node['action'] === 'CREATE') {
                $quiz->questions()->create([
                    'stable_id' => $data['stable_id'] ?? null,
                    ...$this->only($data, self::QUESTION_FIELDS),
                ]);
            } elseif ($node['action'] === 'UPDATE') {
                $this->uniqueQuestion($quiz, $data)->update($this->changedValues($data, $node, self::QUESTION_FIELDS));
            } elseif ($node['action'] !== 'UNCHANGED') {
                throw new DomainException('Une action de question non applicable a été détectée.');
            }
        }
    }

    private function uniqueSection(Training $training, array $data): TrainingSection
    {
        if (! empty($data['stable_id'])) {
            $section = TrainingSection::query()->where('stable_id', $data['stable_id'])->first();
            if (! $section || $section->training_id !== $training->id) {
                throw new DomainException('L’identifiant stable de section est hors du périmètre de la formation.');
            }

            return $section;
        }
        $query = $training->sections()->where('title', $data['title']);
        $exact = (clone $query)->where('sort_order', $data['sort_order'] ?? 0)->get();
        $candidates = $exact->isNotEmpty() ? $exact : $query->get();

        return $this->one($candidates, 'section');
    }

    private function uniqueLesson(Training $training, TrainingSection $section, string $slug): TrainingLesson
    {
        $candidates = $training->lessons()->where('slug', $slug)->get();
        $lesson = $this->one($candidates, 'leçon');
        if ($lesson->training_section_id !== $section->id) {
            throw new DomainException('La leçon identifiée appartient à une autre section.');
        }

        return $lesson;
    }

    private function uniqueResource(TrainingLesson $lesson, array $data): TrainingResource
    {
        if (! empty($data['stable_id'])) {
            $resource = TrainingResource::query()->where('stable_id', $data['stable_id'])->first();
            if (! $resource || $resource->training_lesson_id !== $lesson->id) {
                throw new DomainException('L’identifiant stable de ressource est hors du périmètre de la leçon.');
            }

            return $resource;
        }
        $query = $lesson->resources()->where('title', $data['title']);
        $exact = (clone $query)->where('sort_order', $data['sort_order'] ?? 0)->get();

        return $this->one($exact->isNotEmpty() ? $exact : $query->get(), 'ressource');
    }

    private function uniqueQuestion(TrainingQuiz $quiz, array $data): object
    {
        if (! empty($data['stable_id'])) {
            $question = TrainingQuizQuestion::query()->where('stable_id', $data['stable_id'])->first();
            if (! $question || $question->training_quiz_id !== $quiz->id) {
                throw new DomainException('L’identifiant stable de question est hors du périmètre du quiz.');
            }

            return $question;
        }
        $query = $quiz->questions()->where('question', $data['question']);
        $exact = (clone $query)->where('sort_order', $data['sort_order'] ?? 0)->get();

        return $this->one($exact->isNotEmpty() ? $exact : $query->get(), 'question');
    }

    private function one(object $candidates, string $type): object
    {
        if ($candidates->count() !== 1) {
            throw new DomainException("La correspondance de {$type} n’est plus unique.");
        }

        return $candidates->first();
    }

    private function validateQuestions(array $sections): void
    {
        foreach ($sections as $section) {
            foreach (($section['quiz']['questions'] ?? []) as $question) {
                $options = $question['options'] ?? [];
                $correct = $question['correct_option_index'] ?? null;
                if (! is_int($correct) || ! array_key_exists($correct, $options)) {
                    throw new InvalidArgumentException('Une question de quiz contient une bonne réponse invalide.');
                }
            }
        }
    }

    private function lessonValues(array $data, ?array $node = null): array
    {
        $values = $node
            ? $this->changedValues($data, $node, self::LESSON_FIELDS)
            : $this->only($data, self::LESSON_FIELDS);
        if (array_key_exists('thumbnail', $values) && is_array($values['thumbnail'])) {
            $values['thumbnail'] = json_encode($values['thumbnail'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        }

        return $values;
    }

    private function only(array $data, array $fields): array
    {
        return array_intersect_key($data, array_flip($fields));
    }

    private function changedValues(array $data, array $node, array $allowed): array
    {
        $changed = array_column($node['changes'] ?? [], 'field');

        return $this->only($data, array_values(array_intersect($allowed, $changed)));
    }

    private function report(Training $training, array $plan): array
    {
        $byScope = $plan['summary']['by_scope'];

        return [
            'training' => ['id' => $training->id, 'title' => $training->title, 'slug' => $training->slug],
            'modified' => collect($byScope)->map(fn (array $counts) => $counts['UPDATE'])->all(),
            'created' => collect($byScope)->map(fn (array $counts) => $counts['CREATE'])->all(),
            'preserved' => $plan['summary']['preserved'],
            'deleted' => 0,
        ];
    }
}
