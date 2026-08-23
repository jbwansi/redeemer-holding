<?php

namespace App\Services;

use App\Models\Service;
use App\Services\Packages\SecurePackageArchive;

class ServicePackageExporter
{
    public function __construct(
        private readonly ServiceJsonExporter $jsonExporter,
        private readonly ServicePackageMediaReferences $mediaReferences,
        private readonly SecurePackageArchive $archives,
    ) {}

    public function export(Service $service): string
    {
        $package = $this->jsonExporter->package($service);
        $json = json_encode($package, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL;

        return $this->archives->create(
            'service-package-',
            'service.json',
            $json,
            $this->mediaReferences->collect($package['data']),
            fn (array $included, array $missing): array => [
                'package_version' => '1.0',
                'type' => 'service-package',
                'schema_version' => $package['schema_version'],
                'service_slug' => $package['data']['slug'],
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
