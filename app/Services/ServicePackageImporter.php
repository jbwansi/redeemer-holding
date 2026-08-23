<?php

namespace App\Services;

use App\Services\Packages\PackageMediaTransfer;
use DomainException;

class ServicePackageImporter
{
    public function __construct(
        private readonly ServicePackageAnalyzer $analyzer,
        private readonly ServiceJsonImporter $jsonImporter,
        private readonly ServiceJsonUpdateApplier $updateApplier,
        private readonly PackageMediaTransfer $mediaTransfer,
    ) {}

    public function import(string $path, string $mode, int $authorId, string $filename = ''): array
    {
        $package = $this->analyzer->analyze($path, $filename);
        $expectedStatus = $mode === 'create' ? 'new' : 'existing';
        if (($package['analysis']['status'] ?? null) !== $expectedStatus) {
            throw new DomainException($mode === 'create'
                ? 'Le package ne correspond pas à un nouveau Service.'
                : 'Le package ne cible pas un Service existant.');
        }

        $transfer = $this->mediaTransfer->transfer(
            $path,
            $package['media_files'],
            fn (): array => $mode === 'create'
                ? $this->jsonImporter->import($package['service_json'], $authorId, $filename.'#service.json')
                : $this->updateApplier->apply($package['service_json'], $filename.'#service.json'),
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
