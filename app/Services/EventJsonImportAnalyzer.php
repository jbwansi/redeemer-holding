<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Event;
use Illuminate\Support\Carbon;
use JsonException;

class EventJsonImportAnalyzer
{
    private const ROOT_FIELDS = ['schema_version', 'type', 'exported_at', 'data'];

    private const EVENT_FIELDS = [
        'title', 'slug', 'description', 'content', 'start_date', 'end_date', 'location',
        'featured_image', 'category', 'max_participants', 'price', 'is_published',
        'is_featured', 'published_at', 'tags',
    ];

    private const COMPARABLE_FIELDS = [
        'title', 'slug', 'description', 'content', 'start_date', 'end_date', 'location',
        'featured_image', 'max_participants', 'price', 'is_published', 'is_featured',
        'published_at', 'tags',
    ];

    public function analyze(string $json, string $filename = ''): array
    {
        $result = $this->emptyResult($filename);

        if (trim($json) === '') {
            return $this->invalid($result, 'Le fichier JSON est vide.');
        }

        try {
            $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->invalid($result, 'Le JSON contient une erreur de syntaxe.');
        }

        if (! is_array($package) || array_is_list($package)) {
            return $this->invalid($result, 'La racine du fichier JSON doit être un objet.');
        }

        $result['schema_version'] = $package['schema_version'] ?? null;
        $result['type'] = $package['type'] ?? null;
        $this->validatePackage($package, $result);

        if ($result['errors'] !== []) {
            return $result;
        }

        $data = $package['data'];
        if ($data['featured_image'] !== null && $data['featured_image'] !== [] && $data['featured_image'] !== '') {
            $result['warnings'][] = 'La référence featured_image sera conservée, mais le fichier physique ne sera pas copié.';
        }
        $result['event'] = ['title' => $data['title'], 'slug' => $data['slug']];

        $categoryCandidates = Category::query()->where('slug', $data['category']['slug'])->get(['id', 'name', 'slug']);
        if ($categoryCandidates->count() !== 1) {
            $result['status'] = $categoryCandidates->isEmpty() ? 'invalid' : 'ambiguous';
            $result['errors'][] = $categoryCandidates->isEmpty()
                ? 'La catégorie "'.$data['category']['slug'].'" est absente du catalogue categories.'
                : 'Plusieurs catégories correspondent au slug "'.$data['category']['slug'].'".';
            $result['plan']['category'] = [
                'slug' => $data['category']['slug'],
                'action' => 'AMBIGUOUS',
                'reason' => end($result['errors']),
            ];
            $result['plan']['summary']['ambiguous'] = 1;

            return $result;
        }

        $category = $categoryCandidates->first();
        $result['category'] = ['slug' => $category->slug, 'name' => $category->name];
        $result['plan']['category'] = ['slug' => $category->slug, 'action' => 'UNCHANGED'];

        $eventCandidates = Event::withTrashed()->where('slug', $data['slug'])->get();
        if ($eventCandidates->count() > 1 || ($eventCandidates->first()?->trashed() ?? false)) {
            $result['status'] = 'ambiguous';
            $result['errors'][] = 'Le slug Event "'.$data['slug'].'" correspond à une cible ambiguë ou supprimée.';
            $result['plan']['event'] = ['slug' => $data['slug'], 'action' => 'AMBIGUOUS', 'changes' => []];
            $result['plan']['summary']['ambiguous'] = 1;

            return $result;
        }

        $existing = $eventCandidates->first();
        if (! $existing) {
            $result['valid'] = true;
            $result['status'] = 'new';
            $result['plan']['event'] = ['slug' => $data['slug'], 'action' => 'CREATE', 'changes' => []];
            $result['plan']['summary']['creates'] = 1;
            $result['summary']['changes'] = 1;

            return $result;
        }

        foreach (self::COMPARABLE_FIELDS as $field) {
            $before = $this->existingValue($existing, $field);
            $after = $data[$field];
            $modified = $this->comparable($before, $field) !== $this->comparable($after, $field);
            $result['changes'][] = [
                'field' => $field,
                'label' => $this->fieldLabel($field),
                'status' => $modified ? 'modified' : 'unchanged',
                'action' => $modified ? 'UPDATE' : 'UNCHANGED',
                'before' => $before,
                'after' => $after,
            ];
        }

        $currentCategory = Category::query()->find($existing->category_id, ['name', 'slug']);
        $beforeCategory = $currentCategory ? ['slug' => $currentCategory->slug, 'name' => $currentCategory->name] : null;
        $afterCategory = ['slug' => $category->slug, 'name' => $category->name];
        $categoryModified = $this->comparable($beforeCategory, 'category') !== $this->comparable($afterCategory, 'category');
        $result['changes'][] = [
            'field' => 'category', 'label' => 'Catégorie',
            'status' => $categoryModified ? 'modified' : 'unchanged',
            'action' => $categoryModified ? 'UPDATE' : 'UNCHANGED',
            'before' => $beforeCategory, 'after' => $afterCategory,
        ];

        $modified = collect($result['changes'])->where('status', 'modified')->values()->all();
        $action = $modified === [] ? 'UNCHANGED' : 'UPDATE';
        $result['valid'] = true;
        $result['status'] = 'existing';
        $result['summary']['changes'] = count($modified);
        $result['plan']['event'] = ['slug' => $data['slug'], 'action' => $action, 'changes' => $modified];
        $result['plan']['summary'][$action === 'UPDATE' ? 'updates' : 'unchanged'] = 1;

        return $result;
    }

    private function validatePackage(array $package, array &$result): void
    {
        $this->rejectUnexpectedKeys($package, self::ROOT_FIELDS, 'racine', $result);
        if (($package['schema_version'] ?? null) !== '1.0') {
            $result['errors'][] = 'Seule la version de schéma "1.0" est acceptée.';
        }
        if (($package['type'] ?? null) !== 'event') {
            $result['errors'][] = 'Le champ racine "type" doit être égal à "event".';
        }
        if (! is_string($package['exported_at'] ?? null) || ! $this->validDate($package['exported_at'])) {
            $result['errors'][] = 'Le champ racine "exported_at" doit contenir une date valide.';
        }
        if (! isset($package['data']) || ! is_array($package['data']) || array_is_list($package['data'])) {
            $result['errors'][] = 'Le champ racine "data" doit contenir un objet Event.';

            return;
        }

        $data = $package['data'];
        $this->rejectUnexpectedKeys($data, self::EVENT_FIELDS, 'data', $result);
        foreach (self::EVENT_FIELDS as $field) {
            if (! array_key_exists($field, $data)) {
                $result['errors'][] = 'Le champ "data.'.$field.'" est obligatoire.';
            }
        }
        foreach (['title', 'slug', 'description', 'content', 'location'] as $field) {
            if (! is_string($data[$field] ?? null) || trim($data[$field]) === '') {
                $result['errors'][] = 'Le champ "data.'.$field.'" doit être une chaîne non vide.';
            }
        }
        foreach (['start_date', 'end_date'] as $field) {
            if (! is_string($data[$field] ?? null) || ! $this->validDate($data[$field])) {
                $result['errors'][] = 'Le champ "data.'.$field.'" doit contenir une date valide.';
            }
        }
        if ($this->validDate($data['start_date'] ?? null) && $this->validDate($data['end_date'] ?? null)
            && Carbon::parse($data['end_date'])->lte(Carbon::parse($data['start_date']))) {
            $result['errors'][] = 'Le champ "data.end_date" doit être postérieur à "data.start_date".';
        }
        if (($data['published_at'] ?? null) !== null && (! is_string($data['published_at']) || ! $this->validDate($data['published_at']))) {
            $result['errors'][] = 'Le champ "data.published_at" doit être nul ou contenir une date valide.';
        }
        foreach (['is_published', 'is_featured'] as $field) {
            if (! is_bool($data[$field] ?? null)) {
                $result['errors'][] = 'Le champ "data.'.$field.'" doit être booléen.';
            }
        }
        if (($data['max_participants'] ?? null) !== null
            && (! is_int($data['max_participants']) || $data['max_participants'] < 0)) {
            $result['errors'][] = 'Le champ "data.max_participants" doit être nul ou un entier positif.';
        }
        if (! is_int($data['price'] ?? null) && ! is_float($data['price'] ?? null) && ! is_string($data['price'] ?? null)
            || (is_numeric($data['price'] ?? null) && (float) $data['price'] < 0)
            || ! is_numeric($data['price'] ?? null)) {
            $result['errors'][] = 'Le champ "data.price" doit être un nombre positif.';
        }
        if (($data['tags'] ?? null) !== null
            && (! is_array($data['tags']) || ! array_is_list($data['tags'])
                || collect($data['tags'])->contains(fn ($tag) => ! is_string($tag)))) {
            $result['errors'][] = 'Le champ "data.tags" doit être nul ou un tableau de chaînes.';
        }
        if (! is_array($data['category'] ?? null) || array_is_list($data['category'])) {
            $result['errors'][] = 'Le champ "data.category" doit être un objet.';
        } else {
            $this->rejectUnexpectedKeys($data['category'], ['slug', 'name'], 'data.category', $result);
            foreach (['slug', 'name'] as $field) {
                if (! is_string($data['category'][$field] ?? null) || trim($data['category'][$field]) === '') {
                    $result['errors'][] = 'Le champ "data.category.'.$field.'" doit être une chaîne non vide.';
                }
            }
        }
        $media = $data['featured_image'] ?? null;
        if ($media !== null && ! is_array($media) && ! is_string($media)) {
            $result['errors'][] = 'Le champ "data.featured_image" doit être nul, une chaîne ou un objet.';
        }
    }

    private function rejectUnexpectedKeys(array $data, array $allowed, string $path, array &$result): void
    {
        foreach (array_diff(array_keys($data), $allowed) as $key) {
            $result['errors'][] = 'Le champ "'.$path.'.'.$key.'" n’est pas autorisé.';
        }
    }

    private function existingValue(Event $event, string $field): mixed
    {
        if ($field === 'featured_image') {
            return $this->decodeJson($event->getRawOriginal($field));
        }
        if (in_array($field, ['start_date', 'end_date', 'published_at'], true)) {
            return $event->{$field} ? Carbon::parse($event->{$field})->toIso8601String() : null;
        }

        return $event->{$field};
    }

    private function comparable(mixed $value, string $field): string
    {
        if ($field === 'price' && is_numeric($value)) {
            return number_format((float) $value, 2, '.', '');
        }
        if (in_array($field, ['start_date', 'end_date', 'published_at'], true) && $value) {
            return Carbon::parse($value)->utc()->toIso8601String();
        }
        if (in_array($field, ['is_published', 'is_featured'], true)) {
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

    private function validDate(mixed $value): bool
    {
        if (! is_string($value) || trim($value) === '') {
            return false;
        }
        try {
            Carbon::parse($value);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function fieldLabel(string $field): string
    {
        return [
            'title' => 'Titre', 'slug' => 'Slug', 'description' => 'Description', 'content' => 'Contenu',
            'start_date' => 'Date de début', 'end_date' => 'Date de fin', 'location' => 'Lieu',
            'featured_image' => 'Image', 'max_participants' => 'Participants maximum', 'price' => 'Prix',
            'is_published' => 'Publié', 'is_featured' => 'Mis en avant', 'published_at' => 'Date de publication',
            'tags' => 'Tags',
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
            'event' => ['title' => null, 'slug' => null],
            'category' => null,
            'summary' => ['changes' => 0, 'deleted' => 0],
            'changes' => [],
            'warnings' => [],
            'errors' => [],
            'plan' => [
                'mode' => 'read_only',
                'event' => null,
                'category' => null,
                'excluded_data' => ['action' => 'PRESERVE'],
                'summary' => ['creates' => 0, 'updates' => 0, 'unchanged' => 0, 'preserved' => 1, 'ambiguous' => 0, 'deleted' => 0],
                'can_apply' => false,
                'read_only' => true,
            ],
        ];
    }

    private function invalid(array $result, string $message): array
    {
        $result['errors'][] = $message;

        return $result;
    }
}
