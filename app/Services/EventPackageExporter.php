<?php

namespace App\Services;

use App\Models\Event;
use App\Services\Packages\SecurePackageArchive;

class EventPackageExporter
{
    public function __construct(
        private readonly EventJsonExporter $jsonExporter,
        private readonly EventPackageMediaReferences $mediaReferences,
        private readonly SecurePackageArchive $archives,
    ) {}

    public function export(Event $event): string
    {
        $package = $this->jsonExporter->package($event);
        $json = json_encode($package, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL;

        return $this->archives->create(
            'event-package-',
            'event.json',
            $json,
            $this->mediaReferences->collect($package['data']),
            fn (array $included, array $missing): array => [
                'package_version' => '1.0',
                'type' => 'event-package',
                'schema_version' => $package['schema_version'],
                'event_slug' => $package['data']['slug'],
                'media' => [
                    'included' => count($included),
                    'missing' => count($missing),
                    'files' => $included,
                    'missing_files' => $missing,
                ],
            ],
        );
    }
}
