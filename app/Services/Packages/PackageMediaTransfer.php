<?php

namespace App\Services\Packages;

use DomainException;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PackageMediaTransfer
{
    public function __construct(private readonly SecurePackageArchive $archives) {}

    public function transfer(string $archivePath, array $files, callable $apply): array
    {
        $zip = $this->archives->openReadOnly($archivePath, 'Le package ZIP est illisible.');
        $created = [];
        $copied = 0;
        $reused = 0;

        try {
            foreach ($files as $file) {
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

            return [
                'result' => $apply(),
                'copied' => $copied,
                'reused' => $reused,
            ];
        } catch (Throwable $exception) {
            foreach (array_reverse($created) as [$disk, $path]) {
                Storage::disk($disk)->delete($path);
            }
            throw $exception;
        } finally {
            $zip->close();
        }
    }
}
