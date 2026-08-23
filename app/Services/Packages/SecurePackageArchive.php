<?php

namespace App\Services\Packages;

use DomainException;
use Illuminate\Support\Facades\Storage;
use JsonException;
use RuntimeException;
use Throwable;
use ZipArchive;

class SecurePackageArchive
{
    public function openReadOnly(string $path, string $errorMessage): ZipArchive
    {
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new DomainException($errorMessage);
        }

        return $zip;
    }

    public function inspectEntries(ZipArchive $zip): array
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

            $name = $this->normalizePath((string) $stat['name']);
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

    public function requireEntries(array $entries, array $required): void
    {
        foreach ($required as $name) {
            if (! isset($entries[$name])) {
                throw new DomainException("Le package ne contient pas {$name}.");
            }
        }
    }

    public function read(ZipArchive $zip, string $name, string $errorMessage): string
    {
        $contents = $zip->getFromName($name);
        if (! is_string($contents)) {
            throw new DomainException($errorMessage);
        }

        return $contents;
    }

    public function decodeDocuments(string $documentJson, string $manifestJson): array
    {
        try {
            $document = json_decode($documentJson, true, 512, JSON_THROW_ON_ERROR);
            $manifest = json_decode($manifestJson, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new DomainException('Le manifeste ou le document JSON du package est invalide.');
        }

        return [$document, $manifest];
    }

    public function validateMedia(ZipArchive $zip, array $entries, array $manifest): array
    {
        $files = $manifest['media']['files'] ?? null;
        if (! is_array($files)) {
            throw new DomainException('La liste des médias du manifeste est invalide.');
        }

        $seen = [];
        foreach ($files as $file) {
            $archivePath = is_array($file) ? $this->normalizePath((string) ($file['archive_path'] ?? '')) : '';
            $destination = is_array($file) ? $this->normalizePath((string) ($file['path'] ?? '')) : '';
            if (! str_starts_with($archivePath, 'media/') || $archivePath !== 'media/'.$destination || isset($seen[$archivePath]) || ! isset($entries[$archivePath])) {
                throw new DomainException('Une entrée média du manifeste est absente ou invalide.');
            }
            if (! in_array($file['disk'] ?? null, config('training-packages.allowed_disks'), true)) {
                throw new DomainException('Un disque média du manifeste n’est pas autorisé.');
            }

            $contents = $zip->getFromName($archivePath);
            if (! is_string($contents)
                || strlen($contents) !== ($file['size'] ?? null)
                || ! hash_equals((string) ($file['sha256'] ?? ''), hash('sha256', $contents))) {
                throw new DomainException('L’intégrité d’un média du package est invalide.');
            }
            $seen[$archivePath] = true;
        }

        if (($manifest['media']['included'] ?? null) !== count($files)) {
            throw new DomainException('Le compteur des médias du manifeste est incohérent.');
        }
        foreach (array_keys($entries) as $entry) {
            if (str_starts_with($entry, 'media/') && ! str_ends_with($entry, '/') && ! isset($seen[$entry])) {
                throw new DomainException('Le package contient un média non déclaré dans le manifeste.');
            }
        }

        return array_values($files);
    }

    public function create(
        string $temporaryPrefix,
        string $documentName,
        string $documentJson,
        array $references,
        callable $manifestFactory,
    ): string {
        $temporary = tempnam(sys_get_temp_dir(), $temporaryPrefix);
        if ($temporary === false) {
            throw new RuntimeException('Impossible de préparer le package ZIP.');
        }

        $zip = new ZipArchive;
        if ($zip->open($temporary, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            @unlink($temporary);
            throw new RuntimeException('Impossible de créer le package ZIP.');
        }

        try {
            $zip->addFromString($documentName, $documentJson);
            $included = [];
            $missing = [];
            $archiveHashes = [];
            foreach ($references as $reference) {
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
                $included[] = [...$reference, 'size' => strlen($contents), 'sha256' => $hash];
            }

            $manifest = $manifestFactory($included, $missing);
            $zip->addFromString('manifest.json', json_encode(
                $manifest,
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
            ).PHP_EOL);
            if (! $zip->close()) {
                throw new RuntimeException('Impossible de finaliser le package ZIP.');
            }
        } catch (Throwable $exception) {
            $zip->close();
            @unlink($temporary);
            throw $exception;
        }

        return $temporary;
    }

    public function extractToTemporary(ZipArchive $zip, array $entries): string
    {
        $directory = sys_get_temp_dir().DIRECTORY_SEPARATOR.'secure-package-'.bin2hex(random_bytes(8));
        if (! mkdir($directory, 0700) && ! is_dir($directory)) {
            throw new RuntimeException('Impossible de préparer le répertoire temporaire du package.');
        }

        try {
            foreach (array_keys($entries) as $name) {
                if (str_ends_with($name, '/')) {
                    continue;
                }
                $contents = $this->read($zip, $name, 'Une entrée ZIP est illisible.');
                $destination = $directory.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $name);
                $parent = dirname($destination);
                if (! is_dir($parent) && ! mkdir($parent, 0700, true) && ! is_dir($parent)) {
                    throw new RuntimeException('Impossible de préparer le répertoire temporaire du package.');
                }
                if (file_put_contents($destination, $contents, LOCK_EX) === false) {
                    throw new RuntimeException('Impossible d’extraire une entrée du package.');
                }
            }
        } catch (Throwable $exception) {
            $this->cleanupTemporary($directory);
            throw $exception;
        }

        return $directory;
    }

    public function cleanupTemporary(string $directory): void
    {
        if (! is_dir($directory)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($iterator as $entry) {
            $entry->isDir() ? @rmdir($entry->getPathname()) : @unlink($entry->getPathname());
        }
        @rmdir($directory);
    }

    public function normalizePath(string $path): string
    {
        $path = str_replace('\\', '/', $path);
        if ($path === '' || str_contains($path, "\0") || str_starts_with($path, '/') || preg_match('/^[A-Za-z]:\//', $path)) {
            throw new DomainException('Le package contient un chemin absolu interdit.');
        }
        if (in_array('..', explode('/', $path), true)) {
            throw new DomainException('Le package contient une tentative de traversée de répertoires.');
        }

        return $path;
    }

    private function assertRegularEntry(ZipArchive $zip, int $index, string $name): void
    {
        $zip->getExternalAttributesIndex($index, $opsys, $attributes);
        $type = ($attributes >> 16) & 0170000;
        if ($type !== 0 && $type !== 0100000 && ! (str_ends_with($name, '/') && $type === 0040000)) {
            throw new DomainException('Le package contient un lien symbolique ou un fichier spécial interdit.');
        }
    }
}
