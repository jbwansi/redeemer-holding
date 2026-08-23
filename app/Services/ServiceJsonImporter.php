<?php

namespace App\Services;

use App\Models\Service;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceJsonImporter
{
    public function __construct(private readonly ServiceJsonImportAnalyzer $analyzer) {}

    public function import(string $json, int $authorId, string $filename = ''): array
    {
        $preflight = $this->analyzer->analyze($json, $filename);
        if (! $preflight['valid']) {
            throw ValidationException::withMessages(['file' => $preflight['errors']]);
        }
        if ($preflight['status'] !== 'new') {
            throw new DomainException('Ce slug Service existe déjà ou ne peut pas être résolu sans ambiguïté. Aucun Service n’a été créé.');
        }

        $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $data = $package['data'];

        return DB::transaction(function () use ($json, $filename, $data, $authorId): array {
            if (Service::query()->where('slug', $data['slug'])->lockForUpdate()->exists()) {
                throw new DomainException('Ce slug Service existe désormais. Aucun Service n’a été créé.');
            }
            if (data_get($data, 'publication.position') !== null
                && Service::query()->where('position', data_get($data, 'publication.position'))->lockForUpdate()->exists()) {
                throw new DomainException('La position demandée est désormais occupée. Aucun Service n’a été créé.');
            }

            $analysis = $this->analyzer->analyze($json, $filename);
            if (! $analysis['valid'] || $analysis['status'] !== 'new' || ! $analysis['plan']['can_apply']) {
                throw ValidationException::withMessages(['file' => $analysis['errors'] ?: ['Le fichier ne peut plus créer ce Service.']]);
            }

            $service = Service::create([
                ...$this->analyzer->attributes($data),
                'name' => $data['name'],
                'slug' => $data['slug'],
                'user_id' => $authorId,
            ]);

            return [
                'service' => ['id' => $service->id, 'name' => $service->name, 'slug' => $service->slug],
                'created' => 1,
                'preserved' => $analysis['plan']['summary']['preserved'],
                'deleted' => 0,
                'warnings' => $analysis['warnings'],
            ];
        });
    }
}
