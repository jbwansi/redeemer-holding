<?php

namespace Tests\Unit\Services\Packages;

use App\Services\Packages\PackageMediaTransfer;
use DomainException;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;
use ZipArchive;

class PackageMediaTransferTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_identical_existing_file_is_reused(): void
    {
        Storage::disk('public')->put('files/a.txt', 'same');
        [$path, $files] = $this->package(['files/a.txt' => 'same']);

        $transfer = app(PackageMediaTransfer::class)->transfer($path, $files, fn () => ['ok' => true]);

        $this->assertSame(0, $transfer['copied']);
        $this->assertSame(1, $transfer['reused']);
        $this->assertSame('same', Storage::disk('public')->get('files/a.txt'));
    }

    public function test_content_collision_never_overwrites_existing_file(): void
    {
        Storage::disk('public')->put('files/a.txt', 'existing');
        [$path, $files] = $this->package(['files/a.txt' => 'incoming']);

        try {
            app(PackageMediaTransfer::class)->transfer($path, $files, fn () => []);
            $this->fail('La collision aurait dû bloquer le transfert.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('Aucun fichier n’a été écrasé', $exception->getMessage());
        }
        $this->assertSame('existing', Storage::disk('public')->get('files/a.txt'));
    }

    public function test_failure_compensates_new_files_but_preserves_preexisting_files(): void
    {
        Storage::disk('public')->put('files/existing.txt', 'existing');
        [$path, $files] = $this->package([
            'files/existing.txt' => 'existing',
            'files/new.txt' => 'new',
        ]);

        try {
            app(PackageMediaTransfer::class)->transfer($path, $files, function (): never {
                throw new RuntimeException('database failed');
            });
            $this->fail('L’échec applicatif aurait dû être propagé.');
        } catch (RuntimeException $exception) {
            $this->assertSame('database failed', $exception->getMessage());
        }

        Storage::disk('public')->assertExists('files/existing.txt');
        Storage::disk('public')->assertMissing('files/new.txt');
        $this->assertSame('existing', Storage::disk('public')->get('files/existing.txt'));
    }

    private function package(array $media): array
    {
        $path = tempnam(sys_get_temp_dir(), 'media-transfer-test-');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $files = [];
        foreach ($media as $destination => $contents) {
            $archivePath = 'media/'.$destination;
            $zip->addFromString($archivePath, $contents);
            $files[] = [
                'disk' => 'public',
                'path' => $destination,
                'archive_path' => $archivePath,
                'size' => strlen($contents),
                'sha256' => hash('sha256', $contents),
            ];
        }
        $zip->close();

        return [$path, $files];
    }
}
