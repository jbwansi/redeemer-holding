<?php

namespace App\Services;

use App\Models\Service;

class ServiceJsonExporter
{
    public function package(Service $service): array
    {
        return [
            'schema_version' => '1.0',
            'type' => 'service',
            'exported_at' => now()->toIso8601String(),
            'data' => [
                'name' => $service->name,
                'slug' => $service->slug,
                'excerpt' => $service->excerpt,
                'content' => $service->content,
                'icon' => $service->icon,
                'image' => $this->imageReference($service->image),
                'tagline' => $service->tagline,
                'featured_note' => $service->featured_note,
                'ideal_for' => $service->ideal_for,
                'audiences' => [
                    'individuals' => (bool) $service->is_for_individuals,
                    'organizations' => (bool) $service->is_for_organizations,
                ],
                'cta_primary' => [
                    'label' => $service->cta_primary_label,
                    'url' => $service->cta_primary_url,
                ],
                'cta_secondary' => [
                    'label' => $service->cta_secondary_label,
                    'url' => $service->cta_secondary_url,
                ],
                'publication' => [
                    'status' => (bool) $service->status,
                    'position' => $service->position === null ? null : (int) $service->position,
                    'is_featured' => (bool) $service->is_featured,
                    'featured_badge' => $service->featured_badge,
                    'featured_order' => (int) $service->featured_order,
                ],
            ],
        ];
    }

    public function json(Service $service): string
    {
        return json_encode(
            $this->package($service),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        ).PHP_EOL;
    }

    private function imageReference(mixed $value): ?array
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $path = str_replace('\\', '/', trim($value));
        $path = preg_replace('#^/?storage/#', '', $path);
        if (! is_string($path) || ! str_starts_with($path, 'services/') || $this->unsafePath($path)) {
            return null;
        }

        return ['disk' => 'public', 'path' => $path];
    }

    private function unsafePath(string $path): bool
    {
        return str_contains($path, "\0")
            || str_starts_with($path, '/')
            || preg_match('/^[A-Za-z]:\//', $path) === 1
            || in_array('..', explode('/', $path), true);
    }
}
