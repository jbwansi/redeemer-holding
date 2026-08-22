<?php

namespace App\Services;

use DomainException;
use Illuminate\Support\Facades\Storage;
use Throwable;
use ZipArchive;

class EventPackageImporter
{
    public function __construct(private readonly EventPackageAnalyzer $analyzer, private readonly EventJsonImporter $jsonImporter, private readonly EventJsonUpdateApplier $updateApplier) {}

    public function import(string $path, string $mode, int $authorId, string $filename = ''): array
    {
        $package = $this->analyzer->analyze($path, $filename);
        $expectedStatus = $mode === 'create' ? 'new' : 'existing';
        if (($package['analysis']['status'] ?? null) !== $expectedStatus) {
            throw new DomainException($mode === 'create' ? 'Le package ne correspond pas à un nouvel événement.' : 'Le package ne cible pas un événement existant.');
        }
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new DomainException('Le package ZIP est illisible.');
        }
        $created = [];
        $copied = 0;
        $reused = 0;
        try {
            foreach ($package['media_files'] as $file) {
                $disk = Storage::disk($file['disk']);
                if ($disk->exists($file['path'])) {
                    if (! hash_equals($file['sha256'], hash('sha256', $disk->get($file['path'])))) {
                        throw new DomainException('Un média existant porte le même chemin avec un contenu différent. Aucun fichier n’a été écrasé.');
                    }
                    $reused++;

                    continue;
                }
                $contents = $zip->getFromName($file['archive_path']);
                if (! is_string($contents) || ! $disk->put($file['path'], $contents)) {
                    throw new DomainException('La copie d’un média a échoué.');
                }
                $created[] = [$file['disk'], $file['path']];
                $copied++;
            }
            $result = $mode === 'create'
                ? $this->jsonImporter->import($package['event_json'], $authorId, $filename.'#event.json')
                : $this->updateApplier->apply($package['event_json'], $filename.'#event.json');
            $result['package_media'] = ['copied' => $copied, 'reused' => $reused, 'missing' => $package['package']['media_missing']];

            return $result;
        } catch (Throwable $exception) {
            foreach (array_reverse($created) as [$disk, $file]) {
                Storage::disk($disk)->delete($file);
            }
            throw $exception;
        } finally {
            $zip->close();
        }
    }
}
