<?php

namespace App\Services;

use App\Models\Training;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use ZipArchive;

class TrainingPackageExporter
{
    public function __construct(
        private readonly TrainingJsonExporter $jsonExporter,
        private readonly TrainingPackageMediaReferences $mediaReferences,
    ) {}

    public function export(Training $training): string
    {
        $package = $this->jsonExporter->package($training);
        $json = json_encode($package, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL;
        $temporary = tempnam(sys_get_temp_dir(), 'training-package-');
        if ($temporary === false) {
            throw new RuntimeException('Impossible de préparer le package ZIP.');
        }

        $zip = new ZipArchive;
        if ($zip->open($temporary, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            @unlink($temporary);
            throw new RuntimeException('Impossible de créer le package ZIP.');
        }

        try {
            $zip->addFromString('training.json', $json);
            $included = [];
            $missing = [];
            $archiveHashes = [];
            foreach ($this->mediaReferences->collect($package['data']) as $reference) {
                $disk = Storage::disk($reference['disk']);
                if (! $disk->exists($reference['path'])) {
                    $missing[] = $reference;

                    continue;
                }
                $contents = $disk->get($reference['path']);
                $hash = hash('sha256', $contents);
                if (isset($archiveHashes[$reference['archive_path']])) {
                    if ($archiveHashes[$reference['archive_path']] !== $hash) {
                        $missing[] = [...$reference, 'reason' => 'archive_path_collision'];
                    }

                    continue;
                }
                $archiveHashes[$reference['archive_path']] = $hash;
                $zip->addFromString($reference['archive_path'], $contents);
                $included[] = [
                    ...$reference,
                    'size' => strlen($contents),
                    'sha256' => $hash,
                ];
            }
            $manifest = [
                'package_version' => '1.0',
                'type' => 'training-package',
                'schema_version' => $package['schema_version'],
                'training_slug' => $package['data']['slug'],
                'media' => [
                    'included' => count($included),
                    'missing' => count($missing),
                    'files' => $included,
                    'missing_files' => $missing,
                ],
            ];
            $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL);
            if (! $zip->close()) {
                throw new RuntimeException('Impossible de finaliser le package ZIP.');
            }
        } catch (\Throwable $exception) {
            $zip->close();
            @unlink($temporary);
            throw $exception;
        }

        return $temporary;
    }
}
