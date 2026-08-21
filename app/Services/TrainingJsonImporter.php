<?php

namespace App\Services;

use App\Models\Training;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TrainingJsonImporter
{
    public function __construct(
        private readonly TrainingJsonImportAnalyzer $analyzer,
        private readonly TrainingContentImporter $contentImporter,
    ) {}

    public function import(string $json, string $filename = ''): array
    {
        $analysis = $this->analyzer->analyze($json, $filename);

        if (! $analysis['valid']) {
            throw ValidationException::withMessages(['file' => $analysis['errors']]);
        }
        if ($analysis['status'] !== 'new') {
            throw new DomainException(
                'Cette formation existe déjà. La mise à jour d’une formation existante n’est pas encore disponible. Aucune donnée n’a été modifiée.'
            );
        }

        $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $data = $package['data'];
        $this->validateCreationData($data);

        return DB::transaction(function () use ($data, $analysis): array {
            if (Training::query()->where('slug', $data['slug'])->lockForUpdate()->exists()) {
                throw new DomainException(
                    'Cette formation existe déjà. La mise à jour d’une formation existante n’est pas encore disponible. Aucune donnée n’a été modifiée.'
                );
            }

            $training = Training::create([
                'title' => $data['title'],
                'slug' => $data['slug'],
                'excerpt' => $data['excerpt'] ?? null,
                'content' => $data['content'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'location' => $data['location'],
                'featured_image' => $data['featured_image'] ?? null,
                'max_participants' => $data['max_participants'] ?? null,
                'price' => $data['price'] ?? 0,
                'is_published' => (bool) ($data['is_published'] ?? false),
                'is_featured' => (bool) ($data['is_featured'] ?? false),
                'published_at' => $data['published_at'] ?? null,
                'tags' => $data['tags'] ?? null,
                'meeting_link' => $data['meeting_link'] ?? null,
            ]);

            $counts = $this->contentImporter->import($training, $data['sections'] ?? []);

            return [
                'training' => ['id' => $training->id, 'title' => $training->title, 'slug' => $training->slug],
                'created' => ['trainings' => 1, ...$counts],
                'warnings' => $analysis['warnings'],
            ];
        });
    }

    private function validateCreationData(array $data): void
    {
        Validator::make($data, [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'max_participants' => ['nullable', 'integer', 'min:0'],
            'sections' => ['sometimes', 'array'],
        ], [
            'content.required' => 'Le contenu de la formation est obligatoire pour la création.',
            'location.required' => 'Le lieu de la formation est obligatoire pour la création.',
            'start_date.required' => 'La date de début est obligatoire pour la création.',
            'end_date.required' => 'La date de fin est obligatoire pour la création.',
        ])->validate();
    }
}
