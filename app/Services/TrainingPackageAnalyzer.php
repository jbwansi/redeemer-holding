<?php

namespace App\Services;

use DomainException;
use JsonException;
use ZipArchive;

class TrainingPackageAnalyzer
{
    public function __construct(private readonly TrainingJsonImportAnalyzer $jsonAnalyzer, private readonly TrainingPackageMediaReferences $mediaReferences) {}

    public function analyze(string $path, string $filename = ''): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new DomainException('Le package ZIP est illisible ou invalide.');
        }
        try {
            $entries = $this->inspectEntries($zip);
            foreach (['training.json', 'manifest.json'] as $required) {
                if (! isset($entries[$required])) {
                    throw new DomainException("Le package ne contient pas {$required}.");
                }
            }
            $json = $zip->getFromName('training.json');
            $manifestJson = $zip->getFromName('manifest.json');
            if (! is_string($json) || ! is_string($manifestJson)) {
                throw new DomainException('Le contenu obligatoire du package est illisible.');
            }
            try {
                $document = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
                $manifest = json_decode($manifestJson, true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                throw new DomainException('Le manifeste ou le document JSON du package est invalide.');
            }
            $this->validateManifest($manifest, $document);
            $files = $this->validateMedia($zip, $entries, $manifest);
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

    private function inspectEntries(ZipArchive $zip): array
    {
        if ($zip->numFiles > (int) config('training-packages.max_files')) {
            throw new DomainException('Le package contient trop de fichiers.');
        }
        $entries = [];
        $total = 0;
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $stat = $zip->statIndex($index);
            if (! is_array($stat)) {
                throw new DomainException('Une entrée ZIP est illisible.');
            }
            $name = str_replace('\\', '/', (string) $stat['name']);
            $this->assertSafePath($name);
            if (isset($entries[$name])) {
                throw new DomainException('Le package contient des chemins dupliqués.');
            }
            $this->assertRegularEntry($zip, $index, $name);
            $size = (int) ($stat['size'] ?? 0);
            $compressed = (int) ($stat['comp_size'] ?? 0);
            if ($size > (int) config('training-packages.max_file_uncompressed')) {
                throw new DomainException('Un fichier du package dépasse la taille autorisée.');
            }
            $total += $size;
            if ($total > (int) config('training-packages.max_total_uncompressed')) {
                throw new DomainException('La taille décompressée du package dépasse la limite autorisée.');
            }
            if ($size > 0 && ($compressed === 0 || $size / $compressed > (float) config('training-packages.max_compression_ratio'))) {
                throw new DomainException('Le taux de compression du package est anormal.');
            }
            $entries[$name] = $stat;
        }

        return $entries;
    }

    private function assertSafePath(string $name): void
    {
        if ($name === '' || str_contains($name, "\0") || str_starts_with($name, '/') || preg_match('/^[A-Za-z]:\//', $name)) {
            throw new DomainException('Le package contient un chemin absolu interdit.');
        }
        if (in_array('..', explode('/', $name), true)) {
            throw new DomainException('Le package contient une tentative de traversée de répertoires.');
        }
    }

    private function assertRegularEntry(ZipArchive $zip, int $index, string $name): void
    {
        $zip->getExternalAttributesIndex($index, $opsys, $attributes);
        $type = ($attributes >> 16) & 0170000;
        if ($type !== 0 && $type !== 0100000 && ! (str_ends_with($name, '/') && $type === 0040000)) {
            throw new DomainException('Le package contient un lien symbolique ou un fichier spécial interdit.');
        }
    }

    private function validateManifest(mixed $manifest, mixed $document): void
    {
        if (! is_array($manifest) || ! is_array($document) || ($manifest['package_version'] ?? null) !== '1.0' || ($manifest['type'] ?? null) !== 'training-package' || ($manifest['schema_version'] ?? null) !== ($document['schema_version'] ?? null) || ($manifest['training_slug'] ?? null) !== ($document['data']['slug'] ?? null)) {
            throw new DomainException('Le manifeste du package est incohérent.');
        }
    }

    private function validateMedia(ZipArchive $zip, array $entries, array $manifest): array
    {
        $files = $manifest['media']['files'] ?? null;
        if (! is_array($files)) {
            throw new DomainException('La liste des médias du manifeste est invalide.');
        }
        $seen = [];
        foreach ($files as $file) {
            $archivePath = is_array($file) ? str_replace('\\', '/', (string) ($file['archive_path'] ?? '')) : '';
            $this->assertSafePath($archivePath);
            $destination = is_array($file) ? str_replace('\\', '/', (string) ($file['path'] ?? '')) : '';
            $this->assertSafePath($destination);
            if (! str_starts_with($archivePath, 'media/') || $archivePath !== 'media/'.$destination || isset($seen[$archivePath]) || ! isset($entries[$archivePath])) {
                throw new DomainException('Une entrée média du manifeste est absente ou invalide.');
            }
            if (! in_array($file['disk'] ?? null, config('training-packages.allowed_disks'), true)) {
                throw new DomainException('Un disque média du manifeste n’est pas autorisé.');
            }
            $contents = $zip->getFromName($archivePath);
            if (! is_string($contents) || strlen($contents) !== ($file['size'] ?? null) || ! hash_equals((string) ($file['sha256'] ?? ''), hash('sha256', $contents))) {
                throw new DomainException('L’intégrité d’un média du package est invalide.');
            }
            $seen[$archivePath] = true;
        }
        $declared = $manifest['media']['included'] ?? null;
        if ($declared !== count($files)) {
            throw new DomainException('Le compteur des médias du manifeste est incohérent.');
        }
        foreach (array_keys($entries) as $entry) {
            if (str_starts_with($entry, 'media/') && ! str_ends_with($entry, '/') && ! isset($seen[$entry])) {
                throw new DomainException('Le package contient un média non déclaré dans le manifeste.');
            }
        }

        return array_values($files);
    }
}
