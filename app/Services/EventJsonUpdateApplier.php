<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Event;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventJsonUpdateApplier
{
    private const UPDATABLE_FIELDS = [
        'title', 'description', 'content', 'start_date', 'end_date', 'location',
        'featured_image', 'max_participants', 'price', 'is_published', 'is_featured',
        'published_at', 'tags',
    ];

    public function __construct(private readonly EventJsonImportAnalyzer $analyzer) {}

    public function apply(string $json, string $filename = ''): array
    {
        $preflight = $this->analyzer->analyze($json, $filename);
        if (! $preflight['valid']) {
            throw ValidationException::withMessages(['file' => $preflight['errors']]);
        }
        if ($preflight['status'] !== 'existing') {
            throw new DomainException('L’Event à mettre à jour est absent ou ambigu. Aucune donnée n’a été modifiée.');
        }

        $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $data = $package['data'];

        return DB::transaction(function () use ($json, $filename, $data): array {
            $events = Event::withTrashed()->where('slug', $data['slug'])->lockForUpdate()->get();
            if ($events->count() !== 1 || $events->first()->trashed()) {
                throw new DomainException('L’Event à mettre à jour est absent, ambigu ou supprimé. Aucun restore n’a été effectué.');
            }

            $categories = Category::query()->where('slug', $data['category']['slug'])->lockForUpdate()->get();
            if ($categories->count() !== 1) {
                throw new DomainException('La catégorie demandée est absente ou ambiguë. Aucune donnée n’a été modifiée.');
            }

            $analysis = $this->analyzer->analyze($json, $filename);
            if (! $analysis['valid'] || $analysis['status'] !== 'existing') {
                throw ValidationException::withMessages(['file' => $analysis['errors'] ?: ['Le fichier ne cible plus un Event applicable.']]);
            }

            $event = $events->first();
            $category = $categories->first();
            $modifiedFields = collect($analysis['changes'])->where('action', 'UPDATE')->pluck('field')->all();
            $attributes = [];
            foreach (self::UPDATABLE_FIELDS as $field) {
                if (in_array($field, $modifiedFields, true)) {
                    $attributes[$field] = $data[$field];
                }
            }
            if (in_array('category', $modifiedFields, true)) {
                $attributes['category_id'] = $category->id;
            }
            if ($attributes !== []) {
                $event->update($attributes);
            }

            $warnings = $analysis['warnings'];
            if (in_array('is_featured', $modifiedFields, true) && $data['is_featured'] === true) {
                $warnings[] = 'Cet Event a été marqué comme vedette sans modifier les autres Events vedettes.';
            }

            return [
                'event' => ['id' => $event->id, 'title' => $event->title, 'slug' => $event->slug],
                'category' => ['id' => $category->id, 'name' => $category->name, 'slug' => $category->slug],
                'modified' => ['event_fields' => count($modifiedFields)],
                'modified_fields' => $modifiedFields,
                'preserved' => 1,
                'deleted' => 0,
                'warnings' => array_values(array_unique($warnings)),
            ];
        });
    }
}
