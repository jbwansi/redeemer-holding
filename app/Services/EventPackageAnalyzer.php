<?php

namespace App\Services;

use App\Services\Packages\SecurePackageArchive;
use DomainException;

class EventPackageAnalyzer
{
    public function __construct(
        private readonly EventJsonImportAnalyzer $jsonAnalyzer,
        private readonly EventPackageMediaReferences $mediaReferences,
        private readonly SecurePackageArchive $archives,
    ) {}

    public function analyze(string $path, string $filename = ''): array
    {
        $zip = $this->archives->openReadOnly($path, 'Le package ZIP est illisible ou invalide.');
        try {
            $entries = $this->archives->inspectEntries($zip);
            $this->archives->requireEntries($entries, ['event.json', 'manifest.json']);
            $json = $this->archives->read($zip, 'event.json', 'Le contenu obligatoire du package est illisible.');
            $manifestJson = $this->archives->read($zip, 'manifest.json', 'Le contenu obligatoire du package est illisible.');
            [$document, $manifest] = $this->archives->decodeDocuments($json, $manifestJson);
            $this->validateManifest($manifest, $document);
            $files = $this->archives->validateMedia($zip, $entries, $manifest);
            $analysis = $this->jsonAnalyzer->analyze($json, $filename.'#event.json');
            $expectedReferences = $this->mediaReferences->collect($document['data'] ?? []);
            $expectedByArchivePath = collect($expectedReferences)->keyBy('archive_path');
            foreach ($files as $file) {
                $expected = $expectedByArchivePath->get($file['archive_path']);
                if (! $expected || $expected['disk'] !== $file['disk'] || $expected['path'] !== $file['path']) {
                    throw new DomainException('Le manifeste déclare un média qui n’est pas référencé par featured_image.');
                }
            }
            $present = array_fill_keys(array_column($files, 'archive_path'), true);
            $missing = [];
            foreach ($manifest['media']['missing_files'] ?? [] as $item) {
                if (is_array($item) && isset($item['disk'], $item['path'])) {
                    $missing[$item['disk'].':'.$item['path']] = $item;
                }
            }
            foreach ($expectedReferences as $item) {
                if (! isset($present[$item['archive_path']])) {
                    $missing[$item['disk'].':'.$item['path']] = $item;
                }
            }
            if ($missing !== []) {
                $analysis['warnings'][] = count($missing).' média(s) référencé(s) ne sont pas inclus dans le package.';
            }

            return ['analysis' => $analysis, 'event_json' => $json, 'manifest' => $manifest, 'media_files' => $files,
                'package' => ['valid' => true, 'event_json_present' => true, 'manifest_present' => true, 'media_included' => count($files), 'media_missing' => count($missing), 'integrity' => 'ok', 'conflicts' => []]];
        } finally {
            $zip->close();
        }
    }

    private function validateManifest(mixed $manifest, mixed $document): void
    {
        if (! is_array($manifest) || ! is_array($document) || ($manifest['package_version'] ?? null) !== '1.0' || ($manifest['type'] ?? null) !== 'event-package' || ($manifest['schema_version'] ?? null) !== ($document['schema_version'] ?? null) || ($manifest['event_slug'] ?? null) !== ($document['data']['slug'] ?? null)) {
            throw new DomainException('Le manifeste du package est incohérent.');
        }
    }
}
