<?php

namespace App\Services;

use App\Models\Service;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceJsonUpdateApplier
{
    public function __construct(private readonly ServiceJsonImportAnalyzer $analyzer) {}

    public function apply(string $json, string $filename = ''): array
    {
        $preflight = $this->analyzer->analyze($json, $filename);
        if (! $preflight['valid']) {
            throw ValidationException::withMessages(['file' => $preflight['errors']]);
        }
        if ($preflight['status'] !== 'existing') {
            throw new DomainException('Le Service à mettre à jour est absent ou ambigu. Aucune donnée n’a été modifiée.');
        }

        $package = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $data = $package['data'];

        return DB::transaction(function () use ($json, $filename, $data): array {
            $services = Service::query()->where('slug', $data['slug'])->lockForUpdate()->get();
            if ($services->count() !== 1) {
                throw new DomainException('Le Service à mettre à jour est absent ou ambigu. Aucune donnée n’a été modifiée.');
            }

            $position = data_get($data, 'publication.position');
            if ($position !== null && array_key_exists('position', $data['publication'] ?? [])) {
                $conflicts = Service::query()
                    ->where('position', $position)
                    ->whereKeyNot($services->first()->getKey())
                    ->lockForUpdate()
                    ->get();
                if ($conflicts->isNotEmpty()) {
                    throw new DomainException('La position demandée est occupée. Aucun déplacement implicite ne sera effectué.');
                }
            }

            $analysis = $this->analyzer->analyze($json, $filename);
            if (! $analysis['valid'] || $analysis['status'] !== 'existing' || ! $analysis['plan']['can_apply']) {
                throw ValidationException::withMessages(['file' => $analysis['errors'] ?: ['Le fichier ne cible plus un Service applicable.']]);
            }

            $updatedPaths = collect($analysis['changes'])->where('action', 'UPDATE')->pluck('field')->all();
            $attributes = $this->analyzer->attributesForPaths($data, $updatedPaths);
            $service = $services->first();
            if ($attributes !== []) {
                $service->update($attributes);
            }

            return [
                'service' => ['id' => $service->id, 'name' => $service->name, 'slug' => $service->slug],
                'modified' => ['service_fields' => count($attributes)],
                'modified_fields' => $updatedPaths,
                'preserved' => $analysis['plan']['summary']['preserved'],
                'deleted' => 0,
                'warnings' => $analysis['warnings'],
            ];
        });
    }
}
