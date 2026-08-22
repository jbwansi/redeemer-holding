<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Event;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventJsonImporter
{
    public function __construct(private readonly EventJsonImportAnalyzer $analyzer) {}

    public function import(string $json, int $authorId, string $filename = ''): array
    {
        $analysis = $this->analyzer->analyze($json, $filename);

        if (! $analysis['valid']) {
            throw ValidationException::withMessages(['file' => $analysis['errors']]);
        }
        if ($analysis['status'] !== 'new') {
            throw new DomainException(
                'Ce slug Event existe déjà, éventuellement dans la corbeille. Aucun événement n’a été créé.'
            );
        }

        $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $data = $package['data'];

        return DB::transaction(function () use ($data, $analysis, $authorId): array {
            $categories = Category::query()
                ->where('slug', $data['category']['slug'])
                ->lockForUpdate()
                ->get();

            if ($categories->count() !== 1) {
                throw new DomainException(
                    'La catégorie demandée est absente ou ambiguë. Aucun événement n’a été créé.'
                );
            }

            if (Event::withTrashed()->where('slug', $data['slug'])->lockForUpdate()->exists()) {
                throw new DomainException(
                    'Ce slug Event existe déjà, éventuellement dans la corbeille. Aucun événement n’a été créé.'
                );
            }

            $category = $categories->first();
            $event = Event::create([
                'title' => $data['title'],
                'slug' => $data['slug'],
                'description' => $data['description'],
                'content' => $data['content'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'location' => $data['location'],
                'featured_image' => $data['featured_image'],
                'category_id' => $category->id,
                'user_id' => $authorId,
                'max_participants' => $data['max_participants'],
                'price' => $data['price'],
                'is_published' => $data['is_published'],
                'is_featured' => $data['is_featured'],
                'published_at' => $data['published_at'],
                'tags' => $data['tags'],
            ]);

            $warnings = $analysis['warnings'];
            if ($data['featured_image'] !== null && $data['featured_image'] !== [] && $data['featured_image'] !== '') {
                $warnings[] = 'La référence featured_image a été conservée, mais aucun fichier physique n’a été copié.';
            }

            return [
                'event' => ['id' => $event->id, 'title' => $event->title, 'slug' => $event->slug],
                'category' => ['id' => $category->id, 'name' => $category->name, 'slug' => $category->slug],
                'created' => ['events' => 1],
                'preserved' => 1,
                'deleted' => 0,
                'warnings' => array_values(array_unique($warnings)),
            ];
        });
    }
}
