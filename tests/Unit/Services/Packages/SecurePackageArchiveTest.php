<?php

namespace Tests\Unit\Services\Packages;

use App\Services\Packages\SecurePackageArchive;
use DomainException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;
use ZipArchive;

class SecurePackageArchiveTest extends TestCase
{
    private SecurePackageArchive $archives;

    protected function setUp(): void
    {
        parent::setUp();
        $this->archives = app(SecurePackageArchive::class);
        config()->set('training-packages', [
            'max_files' => 10,
            'max_total_uncompressed' => 1024,
            'max_file_uncompressed' => 512,
            'max_compression_ratio' => 200,
            'allowed_disks' => ['public', 'local'],
        ]);
    }

    #[DataProvider('unsafePathProvider')]
    public function test_unsafe_paths_are_rejected(string $path): void
    {
        $this->expectException(DomainException::class);
        $this->archives->normalizePath($path);
    }

    public static function unsafePathProvider(): array
    {
        return [
            'absolute Unix' => ['/etc/passwd'],
            'absolute Windows' => ['C:\\Windows\\system.ini'],
            'parent traversal' => ['media/../secret.txt'],
            'null byte' => ["media/file\0.txt"],
        ];
    }

    public function test_duplicate_entries_are_rejected(): void
    {
        $path = $this->zip(fn (ZipArchive $zip) => $zip->addFromString('media/files/a.txt', 'payload'));
        $zip = $this->archives->openReadOnly($path, 'invalid');
        try {
            $entries = $this->archives->inspectEntries($zip);
            $file = [
                'disk' => 'public',
                'path' => 'files/a.txt',
                'archive_path' => 'media/files/a.txt',
                'size' => 7,
                'sha256' => hash('sha256', 'payload'),
            ];
            $manifest = ['media' => ['included' => 2, 'files' => [$file, $file]]];

            $this->expectException(DomainException::class);
            $this->archives->validateMedia($zip, $entries, $manifest);
        } finally {
            $zip->close();
        }
    }

    public function test_symbolic_links_and_special_files_are_rejected(): void
    {
        $path = $this->zip(function (ZipArchive $zip): void {
            $zip->addFromString('link', 'target');
            $zip->setExternalAttributesName('link', ZipArchive::OPSYS_UNIX, 0120777 << 16);
        });

        $this->expectException(DomainException::class);
        $this->inspect($path);
    }

    public function test_entry_count_limit_is_enforced(): void
    {
        config()->set('training-packages.max_files', 1);
        $path = $this->zip(fn (ZipArchive $zip) => [$zip->addFromString('a', 'a'), $zip->addFromString('b', 'b')]);

        $this->expectException(DomainException::class);
        $this->inspect($path);
    }

    public function test_individual_and_total_size_limits_are_enforced(): void
    {
        config()->set('training-packages.max_file_uncompressed', 3);
        $individual = $this->zip(fn (ZipArchive $zip) => $zip->addFromString('large', '1234'));
        try {
            $this->inspect($individual);
            $this->fail('La limite individuelle aurait dû être appliquée.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('taille autorisée', $exception->getMessage());
        }

        config()->set('training-packages.max_file_uncompressed', 10);
        config()->set('training-packages.max_total_uncompressed', 5);
        $total = $this->zip(fn (ZipArchive $zip) => [$zip->addFromString('a', '123'), $zip->addFromString('b', '456')]);

        $this->expectException(DomainException::class);
        $this->inspect($total);
    }

    public function test_compression_ratio_limit_is_enforced(): void
    {
        config()->set('training-packages.max_compression_ratio', 2);
        $path = $this->zip(fn (ZipArchive $zip) => $zip->addFromString('compressed', str_repeat('A', 1000)));

        $this->expectException(DomainException::class);
        $this->inspect($path);
    }

    public function test_invalid_manifest_document_is_rejected(): void
    {
        $this->expectException(DomainException::class);
        $this->archives->decodeDocuments('{"data":{}}', '{invalid');
    }

    public function test_forged_media_size_and_sha256_are_rejected(): void
    {
        $path = $this->zip(fn (ZipArchive $zip) => $zip->addFromString('media/files/a.txt', 'payload'));
        $zip = $this->archives->openReadOnly($path, 'invalid');
        try {
            $entries = $this->archives->inspectEntries($zip);
            $base = [
                'media' => [
                    'included' => 1,
                    'files' => [[
                        'disk' => 'public',
                        'path' => 'files/a.txt',
                        'archive_path' => 'media/files/a.txt',
                        'size' => 7,
                        'sha256' => hash('sha256', 'payload'),
                    ]],
                ],
            ];

            $badSize = $base;
            $badSize['media']['files'][0]['size'] = 99;
            try {
                $this->archives->validateMedia($zip, $entries, $badSize);
                $this->fail('Une taille falsifiée aurait dû être rejetée.');
            } catch (DomainException $exception) {
                $this->assertStringContainsString('intégrité', $exception->getMessage());
            }

            $badHash = $base;
            $badHash['media']['files'][0]['sha256'] = str_repeat('0', 64);
            $this->expectException(DomainException::class);
            $this->archives->validateMedia($zip, $entries, $badHash);
        } finally {
            $zip->close();
        }
    }

    public function test_safe_temporary_extraction_can_be_cleaned(): void
    {
        $path = $this->zip(fn (ZipArchive $zip) => $zip->addFromString('media/files/a.txt', 'payload'));
        $zip = $this->archives->openReadOnly($path, 'invalid');
        $directory = $this->archives->extractToTemporary($zip, $this->archives->inspectEntries($zip));
        $zip->close();

        $this->assertFileExists($directory.DIRECTORY_SEPARATOR.'media'.DIRECTORY_SEPARATOR.'files'.DIRECTORY_SEPARATOR.'a.txt');
        $this->archives->cleanupTemporary($directory);
        $this->assertDirectoryDoesNotExist($directory);
    }

    private function inspect(string $path): array
    {
        $zip = $this->archives->openReadOnly($path, 'invalid');
        try {
            return $this->archives->inspectEntries($zip);
        } finally {
            $zip->close();
        }
    }

    private function zip(callable $write): string
    {
        $path = tempnam(sys_get_temp_dir(), 'secure-package-test-');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $write($zip);
        $zip->close();

        return $path;
    }
}
