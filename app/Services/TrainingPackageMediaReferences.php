<?php

namespace App\Services;

class TrainingPackageMediaReferences
{
    public function collect(array $data): array
    {
        $references = [];
        $this->addImageValues($references, $data['featured_image'] ?? null, 'public');

        foreach ($data['sections'] ?? [] as $section) {
            foreach ($section['lessons'] ?? [] as $lesson) {
                $this->addImageValues($references, $lesson['thumbnail'] ?? null, 'public');
                if ($this->localPath($lesson['video_url'] ?? null)) {
                    $this->add($references, 'public', $lesson['video_url']);
                }
                foreach ($lesson['resources'] ?? [] as $resource) {
                    if ($this->localPath($resource['file_path'] ?? null)) {
                        $this->add($references, $resource['file_disk'] ?? 'public', $resource['file_path']);
                    }
                }
            }
        }

        return array_values($references);
    }

    private function addImageValues(array &$references, mixed $value, string $disk): void
    {
        if (is_array($value)) {
            array_walk_recursive($value, function ($path) use (&$references, $disk): void {
                if ($this->localPath($path)) {
                    $this->add($references, $disk, $path);
                }
            });
        } elseif ($this->localPath($value)) {
            $this->add($references, $disk, $value);
        }
    }

    private function add(array &$references, string $disk, string $path): void
    {
        $path = $this->normalize($path);
        if ($path === '' || ! in_array($disk, config('training-packages.allowed_disks'), true)) {
            return;
        }
        $references[$disk.':'.$path] = [
            'disk' => $disk,
            'path' => $path,
            'archive_path' => 'media/'.$path,
        ];
    }

    private function localPath(mixed $path): bool
    {
        return is_string($path)
            && trim($path) !== ''
            && ! preg_match('#^(?:https?:)?//#i', trim($path));
    }

    private function normalize(string $path): string
    {
        $path = str_replace('\\', '/', trim($path));
        $path = preg_replace('#^/?storage/#', '', $path);
        if (str_starts_with($path, '/') || preg_match('/^[A-Za-z]:\//', $path) || in_array('..', explode('/', $path), true)) {
            return '';
        }

        return ltrim($path, '/');
    }
}
