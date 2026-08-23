<?php

namespace App\Services;

use App\Services\Packages\SecurePackageArchive;
use DomainException;

class TrainingPackageAnalyzer
{
    public function __construct(
        private readonly TrainingJsonImportAnalyzer $jsonAnalyzer,
        private readonly TrainingPackageMediaReferences $mediaReferences,
        private readonly SecurePackageArchive $archives,
    ) {}

    public function analyze(string $path, string $filename = ''): array
    {
        $zip = $this->archives->openReadOnly($path, 'Le package ZIP est illisible ou invalide.');
        try {
            $entries = $this->archives->inspectEntries($zip);
            $this->archives->requireEntries($entries, ['training.json', 'manifest.json']);
            $json = $this->archives->read($zip, 'training.json', 'Le contenu obligatoire du package est illisible.');
            $manifestJson = $this->archives->read($zip, 'manifest.json', 'Le contenu obligatoire du package est illisible.');
            [$document, $manifest] = $this->archives->decodeDocuments($json, $manifestJson);
            $this->validateManifest($manifest, $document);
            $files = $this->archives->validateMedia($zip, $entries, $manifest);
            $analysis = $this->jsonAnalyzer->analyze($json, $filename.'#training.json');
            $expected = $this->mediaReferences->collect($document['data'] ?? []);
            $present = array_fill_keys(array_column($files, 'archive_path'), true);
            $missingByReference = [];
            foreach ($manifest['media']['missing_files'] ?? [] as $item) {
                if (is_array($item) && isset($item['disk'], $item['path'])) {
                    $missingByReference[$item['disk'].':'.$item['path']] = $item;
                }
            }
            foreach ($expected as $item) {
                if (! isset($present[$item['archive_path']])) {
                    $missingByReference[$item['disk'].':'.$item['path']] = $item;
                }
            }
            $missing = array_values($missingByReference);
            if ($missing !== []) {
                $analysis['warnings'][] = count($missing).' média(s) référencé(s) ne sont pas inclus dans le package.';
            }

            return [
                'analysis' => $analysis,
                'training_json' => $json,
                'manifest' => $manifest,
                'media_files' => $files,
                'package' => ['valid' => true, 'training_json_present' => true, 'manifest_present' => true, 'media_included' => count($files), 'media_missing' => count($missing), 'integrity' => 'ok', 'conflicts' => []],
            ];
        } finally {
            $zip->close();
        }
    }

    private function validateManifest(mixed $manifest, mixed $document): void
    {
        if (! is_array($manifest) || ! is_array($document) || ($manifest['package_version'] ?? null) !== '1.0' || ($manifest['type'] ?? null) !== 'training-package' || ($manifest['schema_version'] ?? null) !== ($document['schema_version'] ?? null) || ($manifest['training_slug'] ?? null) !== ($document['data']['slug'] ?? null)) {
            throw new DomainException('Le manifeste du package est incohérent.');
        }
    }
}
