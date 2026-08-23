<?php

namespace App\Services;

use App\Services\Packages\SecurePackageArchive;
use DomainException;

class ServicePackageAnalyzer
{
    public function __construct(
        private readonly ServiceJsonImportAnalyzer $jsonAnalyzer,
        private readonly ServicePackageMediaReferences $mediaReferences,
        private readonly SecurePackageArchive $archives,
    ) {}

    public function analyze(string $path, string $filename = ''): array
    {
        $zip = $this->archives->openReadOnly($path, 'Le package ZIP est illisible ou invalide.');
        try {
            $entries = $this->archives->inspectEntries($zip);
            $this->archives->requireEntries($entries, ['service.json', 'manifest.json']);
            $json = $this->archives->read($zip, 'service.json', 'Le contenu obligatoire du package est illisible.');
            $manifestJson = $this->archives->read($zip, 'manifest.json', 'Le contenu obligatoire du package est illisible.');
            [$document, $manifest] = $this->archives->decodeDocuments($json, $manifestJson);
            $this->validateManifest($manifest, $document);
            $files = $this->archives->validateMedia($zip, $entries, $manifest);

            $expected = $this->mediaReferences->collect($document['data'] ?? []);
            $expectedByArchivePath = collect($expected)->keyBy('archive_path');
            foreach ($files as $file) {
                $reference = $expectedByArchivePath->get($file['archive_path']);
                if (! $reference || $reference['disk'] !== $file['disk'] || $reference['path'] !== $file['path']) {
                    throw new DomainException('Le manifeste déclare un média qui n’est pas référencé par data.image.');
                }
            }

            $analysis = $this->jsonAnalyzer->analyze($json, $filename.'#service.json');
            $present = array_fill_keys(array_column($files, 'archive_path'), true);
            $missing = [];
            foreach ($manifest['media']['missing_files'] ?? [] as $item) {
                if (is_array($item) && isset($item['disk'], $item['path'])) {
                    $missing[$item['disk'].':'.$item['path']] = $item;
                }
            }
            foreach ($expected as $item) {
                if (! isset($present[$item['archive_path']])) {
                    $missing[$item['disk'].':'.$item['path']] = $item;
                }
            }
            if ($missing !== []) {
                $analysis['warnings'][] = count($missing).' média(s) référencé(s) ne sont pas inclus dans le package.';
            } elseif ($files !== []) {
                $analysis['warnings'] = array_values(array_filter(
                    $analysis['warnings'],
                    fn (string $warning): bool => $warning !== 'L’image référencée est absente du disque public. Aucun fichier ne sera inventé par un import JSON.'
                ));
            }

            return [
                'analysis' => $analysis,
                'service_json' => $json,
                'manifest' => $manifest,
                'media_files' => $files,
                'package' => [
                    'valid' => true,
                    'service_json_present' => true,
                    'manifest_present' => true,
                    'media_included' => count($files),
                    'media_missing' => count($missing),
                    'integrity' => 'ok',
                    'conflicts' => [],
                ],
            ];
        } finally {
            $zip->close();
        }
    }

    private function validateManifest(mixed $manifest, mixed $document): void
    {
        if (! is_array($manifest) || ! is_array($document)
            || ($manifest['package_version'] ?? null) !== '1.0'
            || ($manifest['type'] ?? null) !== 'service-package'
            || ($manifest['schema_version'] ?? null) !== ($document['schema_version'] ?? null)
            || ($manifest['service_slug'] ?? null) !== ($document['data']['slug'] ?? null)) {
            throw new DomainException('Le manifeste du package est incohérent.');
        }
    }
}
