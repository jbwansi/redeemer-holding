<?php

namespace App\Services;

use App\Models\Training;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use JsonException;

class TrainingJsonImportAnalyzer
{
    private const TRAINING_FIELDS = [
        'title', 'slug', 'excerpt', 'content', 'start_date', 'end_date', 'location',
        'featured_image', 'max_participants', 'price', 'is_published', 'is_featured',
        'published_at', 'tags', 'meeting_link',
    ];

    public function analyze(string $json, string $filename = ''): array
    {
        $result = $this->emptyResult($filename);

        if (trim($json) === '') {
            return $this->invalid($result, 'Le fichier JSON est vide.');
        }

        try {
            $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            Log::debug('Échec du décodage JSON d’un export de formation.', [
                'filename' => $filename,
                'json_error' => $exception->getMessage(),
            ]);

            return $this->invalid($result, 'Le JSON contient une erreur de syntaxe.');
        }

        if (! is_array($package)) {
            return $this->invalid($result, 'La racine du fichier JSON doit être un objet.');
        }

        $result['schema_version'] = $package['schema_version'] ?? null;
        $result['type'] = $package['type'] ?? null;

        if (! array_key_exists('schema_version', $package)) {
            $result['errors'][] = 'Le champ racine "schema_version" est obligatoire.';
        } elseif (! in_array($package['schema_version'], ['1.0', '1.1'], true)) {
            $result['errors'][] = 'La version de schéma "'.(string) $package['schema_version'].'" n’est pas supportée. Versions acceptées : 1.0 et 1.1.';
        }

        if (! array_key_exists('type', $package)) {
            $result['errors'][] = 'Le champ racine "type" est obligatoire.';
        } elseif ($package['type'] !== 'training') {
            $result['errors'][] = 'Ce fichier contient un export de type "'.(string) $package['type'].'". Un export de formation est attendu.';
        }

        if (! isset($package['data']) || ! is_array($package['data'])) {
            $result['errors'][] = 'Le champ racine "data" doit contenir la formation.';
        }

        if ($result['errors'] !== []) {
            return $result;
        }

        $data = $package['data'];
        $result['training'] = [
            'title' => is_string($data['title'] ?? null) ? $data['title'] : null,
            'slug' => is_string($data['slug'] ?? null) ? $data['slug'] : null,
        ];

        $this->validateTraining($data, $result);
        $this->warnAboutUnexpectedSensitiveFields($package, $result);

        if ($result['errors'] !== []) {
            return $result;
        }

        $this->countContent($data, $result);
        $this->analyzeMedia($data, $result);

        $existing = Training::query()
            ->with(['sections.lessons.resources', 'sections.quiz.questions'])
            ->where('slug', $data['slug'])
            ->first();

        if (! $existing) {
            $result['valid'] = true;
            $result['status'] = 'new';
            $result['summary']['changes'] = 1
                + $result['summary']['sections']
                + $result['summary']['lessons']
                + $result['summary']['resources']
                + $result['summary']['quizzes']
                + $result['summary']['questions'];
            $result['relation_changes'] = [
                'sections' => ['added' => $result['summary']['sections'], 'modified' => 0, 'unchanged' => 0, 'ambiguous' => 0],
                'lessons' => ['added' => $result['summary']['lessons'], 'modified' => 0, 'unchanged' => 0, 'ambiguous' => 0],
                'resources' => ['added' => $result['summary']['resources'], 'modified' => 0, 'unchanged' => 0, 'ambiguous' => 0],
                'quizzes' => ['added' => $result['summary']['quizzes'], 'modified' => 0, 'unchanged' => 0, 'ambiguous' => 0],
                'questions' => ['added' => $result['summary']['questions'], 'modified' => 0, 'unchanged' => 0, 'ambiguous' => 0],
            ];

            return $result;
        }

        $result['valid'] = true;
        $result['status'] = 'existing';
        $this->compareTraining($data, $existing, $result);
        $this->compareRelations($data, $existing, $result);
        $result['summary']['changes'] = collect($result['changes'])->where('status', 'modified')->count()
            + collect($result['relation_changes'])->sum(fn (array $counts) => $counts['added'] + $counts['modified']);

        return $result;
    }

    private function validateTraining(array $data, array &$result): void
    {
        if (! isset($data['title']) || ! is_string($data['title']) || trim($data['title']) === '') {
            $result['errors'][] = 'Le titre de la formation est obligatoire.';
        }
        if (! isset($data['slug']) || ! is_string($data['slug']) || trim($data['slug']) === '') {
            $result['errors'][] = 'Le slug de la formation est obligatoire.';
        }
        if (isset($data['sections']) && ! is_array($data['sections'])) {
            $result['errors'][] = 'Le champ "data.sections" doit être un tableau.';

            return;
        }
        foreach (['start_date', 'end_date', 'published_at'] as $dateField) {
            if (($data[$dateField] ?? null) !== null) {
                try {
                    Carbon::parse($data[$dateField]);
                } catch (\Throwable) {
                    $result['errors'][] = 'Le champ "data.'.$dateField.'" ne contient pas une date valide.';
                }
            }
        }

        foreach ($data['sections'] ?? [] as $sectionIndex => $section) {
            $path = 'data.sections.'.$sectionIndex;
            if (! is_array($section) || ! is_string($section['title'] ?? null) || trim($section['title']) === '') {
                $result['errors'][] = $path.'.title est obligatoire.';

                continue;
            }
            $this->validateStableId($section, $path, $result);
            if (isset($section['lessons']) && ! is_array($section['lessons'])) {
                $result['errors'][] = $path.'.lessons doit être un tableau.';

                continue;
            }
            foreach ($section['lessons'] ?? [] as $lessonIndex => $lesson) {
                $lessonPath = $path.'.lessons.'.$lessonIndex;
                if (! is_array($lesson) || ! is_string($lesson['title'] ?? null) || trim($lesson['title']) === '') {
                    $result['errors'][] = $lessonPath.'.title est obligatoire.';

                    continue;
                }
                if (! is_string($lesson['slug'] ?? null) || trim($lesson['slug']) === '') {
                    $result['errors'][] = $lessonPath.'.slug est obligatoire.';
                }
                if (isset($lesson['resources']) && ! is_array($lesson['resources'])) {
                    $result['errors'][] = $lessonPath.'.resources doit être un tableau.';
                }
                foreach (is_array($lesson['resources'] ?? null) ? $lesson['resources'] : [] as $resourceIndex => $resource) {
                    if (! is_array($resource) || ! is_string($resource['title'] ?? null) || trim($resource['title']) === '') {
                        $result['errors'][] = $lessonPath.'.resources.'.$resourceIndex.'.title est obligatoire.';
                    }
                    if (is_array($resource)) {
                        $this->validateStableId($resource, $lessonPath.'.resources.'.$resourceIndex, $result);
                    }
                }
            }

            if (isset($section['quiz']) && $section['quiz'] !== null) {
                $quiz = $section['quiz'];
                if (! is_array($quiz) || ! is_string($quiz['title'] ?? null) || trim($quiz['title']) === '') {
                    $result['errors'][] = $path.'.quiz.title est obligatoire.';

                    continue;
                }
                if (isset($quiz['questions']) && ! is_array($quiz['questions'])) {
                    $result['errors'][] = $path.'.quiz.questions doit être un tableau.';

                    continue;
                }
                foreach ($quiz['questions'] ?? [] as $questionIndex => $question) {
                    $questionPath = $path.'.quiz.questions.'.$questionIndex;
                    if (! is_array($question) || ! is_string($question['question'] ?? null) || trim($question['question']) === '') {
                        $result['errors'][] = $questionPath.'.question est obligatoire.';

                        continue;
                    }
                    $this->validateStableId($question, $questionPath, $result);
                    if (! isset($question['options']) || ! is_array($question['options'])) {
                        $result['errors'][] = $questionPath.'.options doit être un tableau.';
                    } elseif (isset($question['correct_option_index'])
                        && (! is_int($question['correct_option_index']) || ! array_key_exists($question['correct_option_index'], $question['options']))) {
                        $result['errors'][] = $questionPath.'.correct_option_index ne désigne aucune option.';
                    }
                }
            }
        }
    }

    private function validateStableId(array $data, string $path, array &$result): void
    {
        if (array_key_exists('stable_id', $data)
            && (! is_string($data['stable_id']) || ! Str::isUuid($data['stable_id']))) {
            $result['errors'][] = $path.'.stable_id doit être un UUID valide.';
        }
    }

    private function compareTraining(array $data, Training $existing, array &$result): void
    {
        foreach (self::TRAINING_FIELDS as $field) {
            $before = $this->existingValue($existing, $field);
            $after = $data[$field] ?? null;
            $same = $this->comparable($before, $field) === $this->comparable($after, $field);
            $result['changes'][] = [
                'scope' => 'training',
                'field' => $field,
                'label' => $this->fieldLabel($field),
                'status' => $same ? 'unchanged' : 'modified',
                'before' => $before,
                'after' => $after,
            ];
        }
    }

    private function compareRelations(array $data, Training $existing, array &$result): void
    {
        $result['relation_changes'] = collect(['sections', 'lessons', 'resources', 'quizzes', 'questions'])
            ->mapWithKeys(fn (string $key) => [$key => ['added' => 0, 'modified' => 0, 'unchanged' => 0, 'ambiguous' => 0]])
            ->all();

        foreach ($data['sections'] ?? [] as $sectionData) {
            $sectionCandidates = ! empty($sectionData['stable_id'])
                ? $existing->sections->where('stable_id', $sectionData['stable_id'])
                : $existing->sections->where('title', $sectionData['title']);
            $section = $sectionCandidates->firstWhere('sort_order', $sectionData['sort_order'] ?? 0) ?? $sectionCandidates->first();
            if ($sectionCandidates->count() > 1) {
                $result['relation_changes']['sections']['ambiguous']++;
                $result['warnings'][] = 'Plusieurs sections existantes correspondent au titre "'.$sectionData['title'].'". Le rapprochement par titre et ordre est ambigu.';
            }
            if (! $section) {
                $result['relation_changes']['sections']['added']++;
                foreach ($sectionData['lessons'] ?? [] as $lesson) {
                    $result['relation_changes']['lessons']['added']++;
                    $result['relation_changes']['resources']['added'] += count($lesson['resources'] ?? []);
                }
                if (! empty($sectionData['quiz'])) {
                    $result['relation_changes']['quizzes']['added']++;
                    $result['relation_changes']['questions']['added'] += count($sectionData['quiz']['questions'] ?? []);
                }

                continue;
            }

            $sectionChanged = $this->subsetChanged($sectionData, $section, ['title', 'description', 'sort_order', 'is_published']);
            $result['relation_changes']['sections'][$sectionChanged ? 'modified' : 'unchanged']++;

            foreach ($sectionData['lessons'] ?? [] as $lessonData) {
                $lesson = $existing->sections->flatMap->lessons->firstWhere('slug', $lessonData['slug']);
                if (! $lesson) {
                    $result['relation_changes']['lessons']['added']++;
                    $result['relation_changes']['resources']['added'] += count($lessonData['resources'] ?? []);

                    continue;
                }
                $lessonChanged = $this->subsetChanged($lessonData, $lesson, [
                    'title', 'slug', 'excerpt', 'content', 'video_url', 'video_duration', 'thumbnail', 'sort_order', 'is_free', 'is_published',
                ]);
                $result['relation_changes']['lessons'][$lessonChanged ? 'modified' : 'unchanged']++;
                foreach ($lessonData['resources'] ?? [] as $resourceData) {
                    $candidates = ! empty($resourceData['stable_id'])
                        ? $lesson->resources->where('stable_id', $resourceData['stable_id'])
                        : $lesson->resources->where('title', $resourceData['title']);
                    $resource = $candidates->firstWhere('sort_order', $resourceData['sort_order'] ?? 0) ?? $candidates->first();
                    if ($candidates->count() > 1) {
                        $result['relation_changes']['resources']['ambiguous']++;
                        $result['warnings'][] = 'Plusieurs ressources "'.$resourceData['title'].'" existent dans la leçon "'.$lesson->title.'".';
                    }
                    if (! $resource) {
                        $result['relation_changes']['resources']['added']++;
                    } else {
                        $changed = $this->subsetChanged($resourceData, $resource, [
                            'title', 'description', 'file_path', 'external_url', 'file_disk', 'file_type', 'is_downloadable', 'is_public', 'sort_order',
                        ]);
                        $result['relation_changes']['resources'][$changed ? 'modified' : 'unchanged']++;
                    }
                }
            }

            if (! empty($sectionData['quiz'])) {
                if (! $section->quiz) {
                    $result['relation_changes']['quizzes']['added']++;
                    $result['relation_changes']['questions']['added'] += count($sectionData['quiz']['questions'] ?? []);
                } else {
                    $quizChanged = $this->subsetChanged($sectionData['quiz'], $section->quiz, ['title', 'description', 'passing_score', 'is_published']);
                    $result['relation_changes']['quizzes'][$quizChanged ? 'modified' : 'unchanged']++;
                    foreach ($sectionData['quiz']['questions'] ?? [] as $questionData) {
                        $candidates = ! empty($questionData['stable_id'])
                            ? $section->quiz->questions->where('stable_id', $questionData['stable_id'])
                            : $section->quiz->questions->where('question', $questionData['question']);
                        $question = $candidates->firstWhere('sort_order', $questionData['sort_order'] ?? 0) ?? $candidates->first();
                        if ($candidates->count() > 1) {
                            $result['relation_changes']['questions']['ambiguous']++;
                            $result['warnings'][] = 'Plusieurs questions identiques ont été trouvées dans le quiz "'.$section->quiz->title.'".';
                        }
                        if (! $question) {
                            $result['relation_changes']['questions']['added']++;
                        } else {
                            $changed = $this->subsetChanged($questionData, $question, ['question', 'options', 'correct_option_index', 'sort_order', 'points']);
                            $result['relation_changes']['questions'][$changed ? 'modified' : 'unchanged']++;
                        }
                    }
                }
            }
        }

        $this->warnAboutCurrentElementsMissingFromImport($data, $existing, $result);
    }

    private function warnAboutCurrentElementsMissingFromImport(array $data, Training $existing, array &$result): void
    {
        $importedLessonSlugs = collect($data['sections'] ?? [])->flatMap(fn (array $section) => $section['lessons'] ?? [])->pluck('slug');
        $missing = $existing->sections->flatMap->lessons->whereNotIn('slug', $importedLessonSlugs)->count();
        if ($missing > 0) {
            $result['warnings'][] = $missing.' leçon(s) existent actuellement mais sont absentes du fichier. Aucune stratégie de suppression n’est définie.';
        }
    }

    private function countContent(array $data, array &$result): void
    {
        $sections = $data['sections'] ?? [];
        $result['summary']['sections'] = count($sections);
        foreach ($sections as $section) {
            $result['summary']['lessons'] += count($section['lessons'] ?? []);
            foreach ($section['lessons'] ?? [] as $lesson) {
                $result['summary']['resources'] += count($lesson['resources'] ?? []);
            }
            if (! empty($section['quiz'])) {
                $result['summary']['quizzes']++;
                $result['summary']['questions'] += count($section['quiz']['questions'] ?? []);
            }
        }
    }

    private function analyzeMedia(array $data, array &$result): void
    {
        $references = $this->hasMediaValue($data['featured_image'] ?? null) ? 1 : 0;
        foreach ($data['sections'] ?? [] as $section) {
            foreach ($section['lessons'] ?? [] as $lesson) {
                $references += $this->hasMediaValue($lesson['thumbnail'] ?? null) ? 1 : 0;
                if ($this->isLocalReference($lesson['video_url'] ?? null)) {
                    $references++;
                }
                foreach ($lesson['resources'] ?? [] as $resource) {
                    if (! empty($resource['file_path'])) {
                        $references++;
                    }
                }
            }
        }
        $result['summary']['media_references'] = $references;
        if ($references > 0) {
            $result['warnings'][] = $references.' référence(s) à des fichiers devront être présentes sur l’environnement cible. Les fichiers physiques ne sont pas inclus dans le JSON.';
        }
    }

    private function warnAboutUnexpectedSensitiveFields(array $package, array &$result): void
    {
        $sensitive = ['payments', 'participants', 'users', 'stripe_secret', 'stripe', 'progress', 'registrations'];
        $found = $this->findKeys($package, $sensitive);
        if ($found !== []) {
            $result['warnings'][] = 'Des champs non pris en charge ont été ignorés : '.implode(', ', array_unique($found)).'.';
        }
    }

    private function findKeys(array $values, array $searchedKeys): array
    {
        $found = [];
        foreach ($values as $key => $value) {
            if (is_string($key) && in_array(strtolower($key), $searchedKeys, true)) {
                $found[] = $key;
            }
            if (is_array($value)) {
                $found = [...$found, ...$this->findKeys($value, $searchedKeys)];
            }
        }

        return $found;
    }

    private function subsetChanged(array $incoming, object $existing, array $fields): bool
    {
        foreach ($fields as $field) {
            $before = $field === 'thumbnail'
                ? $this->decodeJson($existing->getRawOriginal($field))
                : $existing->{$field};
            if ($this->comparable($before, $field) !== $this->comparable($incoming[$field] ?? null, $field)) {
                return true;
            }
        }

        return false;
    }

    private function existingValue(Training $training, string $field): mixed
    {
        if ($field === 'featured_image') {
            return $this->decodeJson($training->getRawOriginal($field));
        }
        if (in_array($field, ['start_date', 'end_date', 'published_at'], true)) {
            return $training->{$field} ? Carbon::parse($training->{$field})->toIso8601String() : null;
        }

        return $training->{$field};
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

    private function decodeJson(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }
        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    private function hasMediaValue(mixed $value): bool
    {
        return is_array($value) ? $value !== [] : is_string($value) && trim($value) !== '';
    }

    private function isLocalReference(mixed $value): bool
    {
        return is_string($value) && $value !== '' && ! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://');
    }

    private function fieldLabel(string $field): string
    {
        return [
            'title' => 'Titre', 'slug' => 'Slug', 'excerpt' => 'Résumé', 'content' => 'Contenu',
            'start_date' => 'Date de début', 'end_date' => 'Date de fin', 'location' => 'Lieu',
            'featured_image' => 'Image', 'max_participants' => 'Participants maximum', 'price' => 'Prix',
            'is_published' => 'Publié', 'is_featured' => 'Mis en avant', 'published_at' => 'Date de publication',
            'tags' => 'Tags', 'meeting_link' => 'Lien de réunion',
        ][$field] ?? $field;
    }

    private function emptyResult(string $filename): array
    {
        return [
            'valid' => false,
            'filename' => $filename,
            'schema_version' => null,
            'type' => null,
            'status' => 'invalid',
            'training' => ['title' => null, 'slug' => null],
            'summary' => ['changes' => 0, 'sections' => 0, 'lessons' => 0, 'resources' => 0, 'quizzes' => 0, 'questions' => 0, 'media_references' => 0],
            'changes' => [],
            'relation_changes' => [],
            'warnings' => [],
            'errors' => [],
        ];
    }

    private function invalid(array $result, string $message): array
    {
        $result['errors'][] = $message;

        return $result;
    }
}
