<?php

namespace App\Services;

class ServicePackageMediaReferences
{
    public function collect(array $data): array
    {
        $image = $data['image'] ?? null;
        if (! is_array($image) || ($image['disk'] ?? null) !== 'public' || ! is_string($image['path'] ?? null)) {
            return [];
        }

        $path = str_replace('\\', '/', trim($image['path']));
        if (! str_starts_with($path, 'services/')
            || str_contains($path, "\0")
            || str_starts_with($path, '/')
            || preg_match('/^[A-Za-z]:\//', $path)
            || in_array('..', explode('/', $path), true)) {
            return [];
        }

        return [[
            'disk' => 'public',
            'path' => $path,
            'archive_path' => 'media/'.$path,
        ]];
    }
}
