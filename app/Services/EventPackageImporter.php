<?php

namespace App\Services;

use App\Services\Packages\PackageMediaTransfer;
use DomainException;

class EventPackageImporter
{
    public function __construct(
        private readonly EventPackageAnalyzer $analyzer,
        private readonly EventJsonImporter $jsonImporter,
        private readonly EventJsonUpdateApplier $updateApplier,
        private readonly PackageMediaTransfer $mediaTransfer,
    ) {}

    public function import(string $path, string $mode, int $authorId, string $filename = ''): array
    {
        $package = $this->analyzer->analyze($path, $filename);
        $expectedStatus = $mode === 'create' ? 'new' : 'existing';
        if (($package['analysis']['status'] ?? null) !== $expectedStatus) {
            throw new DomainException($mode === 'create'
                ? 'Le package ne correspond pas à un nouvel événement.'
                : 'Le package ne cible pas un événement existant.');
        }

        $transfer = $this->mediaTransfer->transfer(
            $path,
            $package['media_files'],
            fn (): array => $mode === 'create'
                ? $this->jsonImporter->import($package['event_json'], $authorId, $filename.'#event.json')
                : $this->updateApplier->apply($package['event_json'], $filename.'#event.json'),
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
