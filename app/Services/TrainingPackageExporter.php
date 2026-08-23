<?php

namespace App\Services;

use App\Models\Training;
use App\Services\Packages\SecurePackageArchive;

class TrainingPackageExporter
{
    public function __construct(
        private readonly TrainingJsonExporter $jsonExporter,
        private readonly TrainingPackageMediaReferences $mediaReferences,
        private readonly SecurePackageArchive $archives,
    ) {}

    public function export(Training $training): string
    {
        $package = $this->jsonExporter->package($training);
        $json = json_encode($package, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL;

        return $this->archives->create(
            'training-package-',
            'training.json',
            $json,
            $this->mediaReferences->collect($package['data']),
            fn (array $included, array $missing): array => [
                'package_version' => '1.0',
                'type' => 'training-package',
                'schema_version' => $package['schema_version'],
                'training_slug' => $package['data']['slug'],
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
