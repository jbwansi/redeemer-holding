<?php

namespace App\Services;

class EventPackageMediaReferences
{
    public function collect(array $data): array
    {
        $references = [];
        $value = $data['featured_image'] ?? null;

        if (is_array($value)) {
            array_walk_recursive($value, function ($path) use (&$references): void {
                $this->add($references, $path);
            });
        } else {
            $this->add($references, $value);
        }

        return array_values($references);
    }

    private function add(array &$references, mixed $value): void
    {
        if (! is_string($value) || trim($value) === '' || preg_match('#^(?:https?:)?//#i', trim($value))) {
            return;
        }

        $path = str_replace('\\', '/', trim($value));
        $path = preg_replace('#^/?storage/#', '', $path);
        if ($path === '' || str_starts_with($path, '/') || preg_match('/^[A-Za-z]:\//', $path) || in_array('..', explode('/', $path), true)) {
            return;
        }

        $path = ltrim($path, '/');
        $references['public:'.$path] = ['disk' => 'public', 'path' => $path, 'archive_path' => 'media/'.$path];
    }
}
