<?php

namespace App\Services;

use App\Services\Packages\PackageMediaTransfer;
use DomainException;

class TrainingPackageImporter
{
    public function __construct(
        private readonly TrainingPackageAnalyzer $analyzer,
        private readonly TrainingJsonImporter $jsonImporter,
        private readonly TrainingJsonUpdateApplier $updateApplier,
        private readonly PackageMediaTransfer $mediaTransfer,
    ) {}

    public function import(string $path, string $mode, string $filename = ''): array
    {
        $package = $this->analyzer->analyze($path, $filename);
        $expectedStatus = $mode === 'create' ? 'new' : 'existing';
        if (($package['analysis']['status'] ?? null) !== $expectedStatus) {
            throw new DomainException($mode === 'create'
                ? 'Le package ne correspond pas à une nouvelle formation.'
                : 'Le package ne cible pas une formation existante.');
        }

        $transfer = $this->mediaTransfer->transfer(
            $path,
            $package['media_files'],
            fn (): array => $mode === 'create'
                ? $this->jsonImporter->import($package['training_json'], $filename.'#training.json')
                : $this->updateApplier->apply($package['training_json'], $filename.'#training.json'),
        );
        $result = $transfer['result'];
        $result['package_media'] = [
            'copied' => $transfer['copied'],
            'reused' => $transfer['reused'],
            'missing' => $package['package']['media_missing'],
        ];

        return $result;
    }
}
