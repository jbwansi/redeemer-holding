<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Support\Facades\Storage;
use JsonException;

class ServiceJsonImportAnalyzer
{
    private const ROOT_FIELDS = ['schema_version', 'type', 'exported_at', 'data'];

    private const DATA_FIELDS = [
        'name', 'slug', 'excerpt', 'content', 'icon', 'image', 'tagline', 'featured_note',
        'ideal_for', 'audiences', 'cta_primary', 'cta_secondary', 'publication',
    ];

    private const FLAT_FIELDS = [
        'name' => 'name',
        'excerpt' => 'excerpt',
        'content' => 'content',
        'icon' => 'icon',
        'image' => 'image',
        'tagline' => 'tagline',
        'featured_note' => 'featured_note',
        'ideal_for' => 'ideal_for',
        'audiences.individuals' => 'is_for_individuals',
        'audiences.organizations' => 'is_for_organizations',
        'cta_primary.label' => 'cta_primary_label',
        'cta_primary.url' => 'cta_primary_url',
        'cta_secondary.label' => 'cta_secondary_label',
        'cta_secondary.url' => 'cta_secondary_url',
        'publication.status' => 'status',
        'publication.position' => 'position',
        'publication.is_featured' => 'is_featured',
        'publication.featured_badge' => 'featured_badge',
        'publication.featured_order' => 'featured_order',
    ];

    private const SENSITIVE_KEYS = [
        'id', 'user_id', 'views', 'created_at', 'updated_at', 'service_requests', 'service_request',
        'testimonials', 'payments', 'payment_id', 'stripe_session_id', 'stripe', 'stripe_secret',
        'email', 'phone', 'first_name', 'last_name',
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
        $result['service'] = ['name' => $data['name'] ?? null, 'slug' => $data['slug']];
        $this->mediaWarnings($data, $result);

        $candidates = Service::query()->where('slug', $data['slug'])->get();
        if ($candidates->count() > 1) {
            return $this->ambiguous($result, 'Le slug Service "'.$data['slug'].'" correspond à plusieurs cibles.');
        }

        $existing = $candidates->first();
        if (! $existing) {
            if (! array_key_exists('name', $data) || ! is_string($data['name']) || trim($data['name']) === '') {
                return $this->invalid($result, 'Le champ "data.name" est obligatoire pour créer un Service.');
            }
            if ($this->positionConflict($data, null)) {
                return $this->ambiguous($result, 'La position demandée est déjà utilisée par un autre Service. Aucun déplacement implicite ne sera effectué.');
            }

            $result['valid'] = true;
            $result['status'] = 'new';
            $result['plan']['service'] = ['slug' => $data['slug'], 'action' => 'CREATE'];
            $result['plan']['summary']['creates'] = 1;
            $result['plan']['can_apply'] = true;
            $result['summary']['changes'] = 1;

            return $result;
        }

        if ($this->positionConflict($data, $existing)) {
            return $this->ambiguous($result, 'La position demandée est déjà utilisée par un autre Service. Aucun déplacement implicite ne sera effectué.');
        }

        foreach (self::FLAT_FIELDS as $path => $column) {
            $present = $this->hasPath($data, $path);
            $before = $this->existingValue($existing, $column);
            if (! $present) {
                $result['changes'][] = $this->change($path, 'PRESERVE', $before, null);
                $result['plan']['summary']['preserved']++;

                continue;
            }

            $after = $this->importValue($path, $this->getPath($data, $path));
            $action = $this->comparable($before) === $this->comparable($after) ? 'UNCHANGED' : 'UPDATE';
            $result['changes'][] = $this->change($path, $action, $before, $after);
            $result['plan']['summary'][$action === 'UPDATE' ? 'updates' : 'unchanged']++;
        }

        $updates = collect($result['changes'])->where('action', 'UPDATE')->count();
        $result['valid'] = true;
        $result['status'] = 'existing';
        $result['summary']['changes'] = $updates;
        $result['plan']['service'] = [
            'slug' => $data['slug'],
            'action' => $updates > 0 ? 'UPDATE' : 'UNCHANGED',
        ];
        $result['plan']['can_apply'] = true;

        return $result;
    }

    public function attributes(array $data, bool $onlyPresent = true): array
    {
        $attributes = [];
        foreach (self::FLAT_FIELDS as $path => $column) {
            if ($onlyPresent && ! $this->hasPath($data, $path)) {
                continue;
            }
            if ($this->hasPath($data, $path)) {
                $attributes[$column] = $this->importValue($path, $this->getPath($data, $path));
            }
        }

        return $attributes;
    }

    public function attributesForPaths(array $data, array $paths): array
    {
        $attributes = [];
        foreach ($paths as $path) {
            if (isset(self::FLAT_FIELDS[$path]) && $this->hasPath($data, $path)) {
                $attributes[self::FLAT_FIELDS[$path]] = $this->importValue($path, $this->getPath($data, $path));
            }
        }

        return $attributes;
    }

    private function validatePackage(array $package, array &$result): void
    {
        $this->rejectSensitiveKeys($package, 'racine', $result);
        $this->rejectUnexpectedKeys($package, self::ROOT_FIELDS, 'racine', $result);
        if (($package['schema_version'] ?? null) !== '1.0') {
            $result['errors'][] = 'Seule la version de schéma "1.0" est acceptée.';
        }
        if (($package['type'] ?? null) !== 'service') {
            $result['errors'][] = 'Le champ racine "type" doit être égal à "service".';
        }
        if (! is_string($package['exported_at'] ?? null) || ! $this->validDate($package['exported_at'])) {
            $result['errors'][] = 'Le champ racine "exported_at" doit contenir une date valide.';
        }
        if (! isset($package['data']) || ! is_array($package['data']) || array_is_list($package['data'])) {
            $result['errors'][] = 'Le champ racine "data" doit contenir un objet Service.';

            return;
        }

        $data = $package['data'];
        $this->rejectUnexpectedKeys($data, self::DATA_FIELDS, 'data', $result);
        if (! array_key_exists('slug', $data) || ! is_string($data['slug']) || trim($data['slug']) === '') {
            $result['errors'][] = 'Le champ "data.slug" est obligatoire et doit être une chaîne non vide.';
        } elseif (mb_strlen($data['slug']) > 255) {
            $result['errors'][] = 'Le champ "data.slug" ne doit pas dépasser 255 caractères.';
        }

        foreach (['name', 'excerpt', 'content', 'icon', 'tagline', 'featured_note'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] !== null && ! is_string($data[$field])) {
                $result['errors'][] = 'Le champ "data.'.$field.'" doit être nul ou une chaîne.';
            }
        }
        if (array_key_exists('name', $data) && $data['name'] === null) {
            $result['errors'][] = 'Le champ "data.name" ne peut pas être nul.';
        }
        if (array_key_exists('name', $data) && is_string($data['name']) && trim($data['name']) === '') {
            $result['errors'][] = 'Le champ "data.name" ne peut pas être vide.';
        }
        foreach (['name', 'icon', 'tagline', 'featured_note'] as $field) {
            if (is_string($data[$field] ?? null) && mb_strlen($data[$field]) > 255) {
                $result['errors'][] = 'Le champ "data.'.$field.'" ne doit pas dépasser 255 caractères.';
            }
        }

        $this->validateIdealFor($data, $result);
        $this->validateAudiences($data, $result);
        $this->validateImage($data, $result);
        $this->validateCta($data, 'cta_primary', $result);
        $this->validateCta($data, 'cta_secondary', $result);
        $this->validatePublication($data, $result);
    }

    private function validateIdealFor(array $data, array &$result): void
    {
        if (! array_key_exists('ideal_for', $data) || $data['ideal_for'] === null) {
            return;
        }
        if (! is_array($data['ideal_for']) || ! array_is_list($data['ideal_for'])
            || collect($data['ideal_for'])->contains(fn ($item) => ! is_string($item) || trim($item) === '')) {
            $result['errors'][] = 'Le champ "data.ideal_for" doit être nul ou un tableau ordonné de chaînes non vides.';
        }
    }

    private function validateAudiences(array $data, array &$result): void
    {
        if (! array_key_exists('audiences', $data)) {
            return;
        }
        if (! is_array($data['audiences']) || array_is_list($data['audiences'])) {
            $result['errors'][] = 'Le champ "data.audiences" doit être un objet.';

            return;
        }
        $this->rejectUnexpectedKeys($data['audiences'], ['individuals', 'organizations'], 'data.audiences', $result);
        foreach (['individuals', 'organizations'] as $field) {
            if (array_key_exists($field, $data['audiences']) && ! is_bool($data['audiences'][$field])) {
                $result['errors'][] = 'Le champ "data.audiences.'.$field.'" doit être booléen.';
            }
        }
    }

    private function validateImage(array $data, array &$result): void
    {
        if (! array_key_exists('image', $data) || $data['image'] === null) {
            return;
        }
        if (! is_array($data['image']) || array_is_list($data['image'])) {
            $result['errors'][] = 'Le champ "data.image" doit être nul ou un objet média.';

            return;
        }
        $this->rejectUnexpectedKeys($data['image'], ['disk', 'path'], 'data.image', $result);
        $disk = $data['image']['disk'] ?? null;
        $path = $data['image']['path'] ?? null;
        if ($disk !== 'public') {
            $result['errors'][] = 'Le disque de "data.image" doit être "public".';
        }
        if (! is_string($path) || ! str_starts_with($path, 'services/') || $this->unsafePath((string) $path)) {
            $result['errors'][] = 'Le chemin de "data.image" doit être relatif et situé sous "services/".';
        }
    }

    private function validateCta(array $data, string $key, array &$result): void
    {
        if (! array_key_exists($key, $data)) {
            return;
        }
        if (! is_array($data[$key]) || array_is_list($data[$key])) {
            $result['errors'][] = 'Le champ "data.'.$key.'" doit être un objet.';

            return;
        }
        $this->rejectUnexpectedKeys($data[$key], ['label', 'url'], 'data.'.$key, $result);
        foreach (['label', 'url'] as $field) {
            if (array_key_exists($field, $data[$key]) && $data[$key][$field] !== null && ! is_string($data[$key][$field])) {
                $result['errors'][] = 'Le champ "data.'.$key.'.'.$field.'" doit être nul ou une chaîne.';
            }
            if (is_string($data[$key][$field] ?? null) && mb_strlen($data[$key][$field]) > 255) {
                $result['errors'][] = 'Le champ "data.'.$key.'.'.$field.'" ne doit pas dépasser 255 caractères.';
            }
        }
        $url = $data[$key]['url'] ?? null;
        if (is_string($url) && str_starts_with($url, '//')) {
            $result['errors'][] = 'Le champ "data.'.$key.'.url" ne peut pas être une URL relative au protocole.';
        } elseif (is_string($url) && $url !== '' && ! str_starts_with($url, '/')
            && (! filter_var($url, FILTER_VALIDATE_URL) || ! in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true))) {
            $result['errors'][] = 'Le champ "data.'.$key.'.url" doit être un chemin interne ou une URL HTTP/HTTPS.';
        }
    }

    private function validatePublication(array $data, array &$result): void
    {
        if (! array_key_exists('publication', $data)) {
            return;
        }
        if (! is_array($data['publication']) || array_is_list($data['publication'])) {
            $result['errors'][] = 'Le champ "data.publication" doit être un objet.';

            return;
        }
        $publication = $data['publication'];
        $this->rejectUnexpectedKeys($publication, ['status', 'position', 'is_featured', 'featured_badge', 'featured_order'], 'data.publication', $result);
        foreach (['status', 'is_featured'] as $field) {
            if (array_key_exists($field, $publication) && ! is_bool($publication[$field])) {
                $result['errors'][] = 'Le champ "data.publication.'.$field.'" doit être booléen.';
            }
        }
        if (array_key_exists('position', $publication) && $publication['position'] !== null
            && (! is_int($publication['position']) || $publication['position'] < 1 || $publication['position'] > 3)) {
            $result['errors'][] = 'Le champ "data.publication.position" doit être nul ou un entier compris entre 1 et 3.';
        }
        if (array_key_exists('featured_badge', $publication) && $publication['featured_badge'] !== null
            && (! is_string($publication['featured_badge']) || mb_strlen($publication['featured_badge']) > 255)) {
            $result['errors'][] = 'Le champ "data.publication.featured_badge" doit être nul ou une chaîne de 255 caractères maximum.';
        }
        if (array_key_exists('featured_order', $publication)
            && (! is_int($publication['featured_order']) || $publication['featured_order'] < 0)) {
            $result['errors'][] = 'Le champ "data.publication.featured_order" doit être un entier positif ou nul.';
        }
    }

    private function positionConflict(array $data, ?Service $existing): bool
    {
        if (! $this->hasPath($data, 'publication.position')) {
            return false;
        }
        $position = $this->getPath($data, 'publication.position');
        if ($position === null) {
            return false;
        }

        return Service::query()
            ->where('position', $position)
            ->when($existing, fn ($query) => $query->whereKeyNot($existing->getKey()))
            ->exists();
    }

    private function mediaWarnings(array $data, array &$result): void
    {
        if (is_array($data['image'] ?? null)) {
            $path = $data['image']['path'] ?? null;
            if (is_string($path) && ! Storage::disk('public')->exists($path)) {
                $result['warnings'][] = 'L’image référencée est absente du disque public. Aucun fichier ne sera inventé par un import JSON.';
            }
        }
        if (is_string($data['content'] ?? null)
            && preg_match('#(?:src|href)\s*=\s*["\'](?:/?storage/|/services/)#i', $data['content'])) {
            $result['warnings'][] = 'Le contenu HTML contient une référence locale qui n’est pas transportée par le package Service.';
        }
    }

    private function rejectSensitiveKeys(array $values, string $path, array &$result): void
    {
        foreach ($values as $key => $value) {
            $current = $path.'.'.$key;
            if (is_string($key) && in_array(strtolower($key), self::SENSITIVE_KEYS, true)) {
                $result['errors'][] = 'Le champ sensible "'.$current.'" est interdit.';
            }
            if (is_array($value)) {
                $this->rejectSensitiveKeys($value, $current, $result);
            }
        }
    }

    private function rejectUnexpectedKeys(array $data, array $allowed, string $path, array &$result): void
    {
        foreach (array_diff(array_keys($data), $allowed) as $key) {
            $result['errors'][] = 'Le champ "'.$path.'.'.$key.'" n’est pas autorisé.';
        }
    }

    private function importValue(string $path, mixed $value): mixed
    {
        if ($path === 'image') {
            return is_array($value) ? '/storage/'.$value['path'] : null;
        }
        if ($path === 'ideal_for' && is_array($value)) {
            return array_map(fn (string $item) => trim($item), $value);
        }

        return $value;
    }

    private function existingValue(Service $service, string $column): mixed
    {
        if ($column === 'image') {
            return $this->normalizedImage($service->image);
        }
        if (in_array($column, ['status', 'is_featured', 'is_for_individuals', 'is_for_organizations'], true)) {
            return (bool) $service->{$column};
        }
        if (in_array($column, ['position', 'featured_order'], true) && $service->{$column} !== null) {
            return (int) $service->{$column};
        }

        return $service->{$column};
    }

    private function normalizedImage(mixed $value): mixed
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }
        $path = preg_replace('#^/?storage/#', '', str_replace('\\', '/', trim($value)));

        return is_string($path) ? '/storage/'.$path : $value;
    }

    private function comparable(mixed $value): string
    {
        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function change(string $field, string $action, mixed $before, mixed $after): array
    {
        return [
            'field' => $field,
            'label' => $this->label($field),
            'action' => $action,
            'status' => strtolower($action),
            'before' => $before,
            'after' => $after,
        ];
    }

    private function label(string $field): string
    {
        return [
            'name' => 'Nom', 'excerpt' => 'Résumé', 'content' => 'Contenu', 'icon' => 'Icône',
            'image' => 'Image', 'tagline' => 'Accroche', 'featured_note' => 'Note stratégique',
            'ideal_for' => 'Idéal pour', 'cta_primary.label' => 'CTA principal — libellé',
            'cta_primary.url' => 'CTA principal — URL', 'cta_secondary.label' => 'CTA secondaire — libellé',
            'cta_secondary.url' => 'CTA secondaire — URL', 'publication.status' => 'Statut',
            'publication.position' => 'Position accueil', 'publication.is_featured' => 'Mis en avant',
            'publication.featured_badge' => 'Badge vedette', 'publication.featured_order' => 'Ordre vedette',
        ][$field] ?? $field;
    }

    private function hasPath(array $data, string $path): bool
    {
        $segments = explode('.', $path);
        $value = $data;
        foreach ($segments as $segment) {
            if (! is_array($value) || ! array_key_exists($segment, $value)) {
                return false;
            }
            $value = $value[$segment];
        }

        return true;
    }

    private function getPath(array $data, string $path): mixed
    {
        return data_get($data, $path);
    }

    private function unsafePath(string $path): bool
    {
        $path = str_replace('\\', '/', $path);

        return $path === '' || str_contains($path, "\0") || str_starts_with($path, '/')
            || preg_match('/^[A-Za-z]:\//', $path) === 1 || in_array('..', explode('/', $path), true);
    }

    private function validDate(string $value): bool
    {
        try {
            new \DateTimeImmutable($value);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function ambiguous(array $result, string $message): array
    {
        $result['status'] = 'ambiguous';
        $result['errors'][] = $message;
        $result['plan']['service'] = ['slug' => $result['service']['slug'], 'action' => 'AMBIGUOUS'];
        $result['plan']['summary']['ambiguous'] = 1;

        return $result;
    }

    private function invalid(array $result, string $message): array
    {
        $result['errors'][] = $message;

        return $result;
    }

    private function emptyResult(string $filename): array
    {
        return [
            'valid' => false,
            'filename' => $filename,
            'schema_version' => null,
            'type' => null,
            'status' => 'invalid',
            'service' => ['name' => null, 'slug' => null],
            'summary' => ['changes' => 0, 'deleted' => 0],
            'changes' => [],
            'warnings' => [],
            'errors' => [],
            'plan' => [
                'mode' => 'read_only',
                'service' => null,
                'excluded_data' => ['action' => 'PRESERVE'],
                'summary' => ['creates' => 0, 'updates' => 0, 'unchanged' => 0, 'preserved' => 1, 'ambiguous' => 0, 'deleted' => 0],
                'can_apply' => false,
                'read_only' => true,
            ],
        ];
    }
}
