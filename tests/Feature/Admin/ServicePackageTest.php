<?php

namespace Tests\Feature\Admin;

use App\Models\Service;
use App\Models\User;
use App\Services\ServiceJsonImporter;
use App\Services\ServicePackageAnalyzer;
use App\Services\ServicePackageExporter;
use App\Services\ServicePackageImporter;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class ServicePackageTest extends TestCase
{
    use RefreshDatabase;

    public function test_package_contains_service_json_manifest_and_optional_image(): void
    {
        Storage::fake('public');
        [, $service] = $this->service(['image' => '/storage/services/image.jpg']);
        Storage::disk('public')->put('services/image.jpg', 'image-service');

        $path = app(ServicePackageExporter::class)->export($service);
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($path) === true);
        $this->assertNotFalse($zip->locateName('service.json'));
        $this->assertNotFalse($zip->locateName('manifest.json'));
        $this->assertNotFalse($zip->locateName('media/services/image.jpg'));
        $manifest = json_decode($zip->getFromName('manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('service-package', $manifest['type']);
        $this->assertSame(hash('sha256', 'image-service'), $manifest['media']['files'][0]['sha256']);
        $zip->close();
        unlink($path);

        [, $withoutImage] = $this->service(['slug' => 'sans-image', 'image' => null]);
        $path = app(ServicePackageExporter::class)->export($withoutImage);
        $analysis = app(ServicePackageAnalyzer::class)->analyze($path);
        $this->assertSame(0, $analysis['package']['media_included']);
        unlink($path);
    }

    public function test_package_create_copies_then_update_reuses_identical_image(): void
    {
        Storage::fake('public');
        [$admin, $service] = $this->service(['image' => '/storage/services/image.jpg']);
        Storage::disk('public')->put('services/image.jpg', 'source');
        $path = app(ServicePackageExporter::class)->export($service);
        $service->delete();
        Storage::disk('public')->delete('services/image.jpg');

        $created = app(ServicePackageImporter::class)->import($path, 'create', $admin->id);
        $updated = app(ServicePackageImporter::class)->import($path, 'update', $admin->id);

        $this->assertSame(['copied' => 1, 'reused' => 0, 'missing' => 0], $created['package_media']);
        $this->assertSame(['copied' => 0, 'reused' => 1, 'missing' => 0], $updated['package_media']);
        $this->assertSame('/storage/services/image.jpg', Service::where('slug', 'package-service')->value('image'));
        $this->assertSame(0, $updated['deleted']);
        unlink($path);
    }

    public function test_media_collision_never_overwrites_preexisting_file(): void
    {
        Storage::fake('public');
        [$admin, $service] = $this->service(['image' => '/storage/services/image.jpg']);
        Storage::disk('public')->put('services/image.jpg', 'source');
        $path = app(ServicePackageExporter::class)->export($service);
        $service->delete();
        Storage::disk('public')->put('services/image.jpg', 'preexisting');

        try {
            app(ServicePackageImporter::class)->import($path, 'create', $admin->id);
            $this->fail('La collision aurait dû être refusée.');
        } catch (DomainException) {
            $this->assertSame('preexisting', Storage::disk('public')->get('services/image.jpg'));
        } finally {
            unlink($path);
        }
    }

    public function test_database_failure_removes_only_newly_copied_image(): void
    {
        Storage::fake('public');
        [$admin, $service] = $this->service(['image' => '/storage/services/new.jpg']);
        Storage::disk('public')->put('services/new.jpg', 'source');
        Storage::disk('public')->put('services/existing.jpg', 'keep');
        $path = app(ServicePackageExporter::class)->export($service);
        $service->delete();
        Storage::disk('public')->delete('services/new.jpg');
        $this->mock(ServiceJsonImporter::class)->shouldReceive('import')->once()->andThrow(new DomainException('DB failure'));

        try {
            app(ServicePackageImporter::class)->import($path, 'create', $admin->id);
            $this->fail('L’échec aurait dû être propagé.');
        } catch (DomainException $exception) {
            $this->assertSame('DB failure', $exception->getMessage());
            Storage::disk('public')->assertMissing('services/new.jpg');
            Storage::disk('public')->assertExists('services/existing.jpg');
        } finally {
            unlink($path);
        }
    }

    public function test_forged_manifest_or_media_hash_is_rejected(): void
    {
        Storage::fake('public');
        [, $service] = $this->service(['image' => '/storage/services/image.jpg']);
        Storage::disk('public')->put('services/image.jpg', 'source');
        $path = app(ServicePackageExporter::class)->export($service);
        $zip = new ZipArchive;
        $zip->open($path);
        $zip->deleteName('media/services/image.jpg');
        $zip->addFromString('media/services/image.jpg', 'forged');
        $zip->close();

        $this->expectException(DomainException::class);
        try {
            app(ServicePackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_manifest_cannot_inject_unreferenced_media(): void
    {
        Storage::fake('public');
        [, $service] = $this->service(['image' => null]);
        $path = app(ServicePackageExporter::class)->export($service);
        $zip = new ZipArchive;
        $zip->open($path);
        $manifest = json_decode($zip->getFromName('manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $contents = 'injected';
        $file = ['disk' => 'public', 'path' => 'services/injected.jpg', 'archive_path' => 'media/services/injected.jpg', 'size' => strlen($contents), 'sha256' => hash('sha256', $contents)];
        $manifest['media']['included'] = 1;
        $manifest['media']['files'] = [$file];
        $zip->deleteName('manifest.json');
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_THROW_ON_ERROR));
        $zip->addFromString($file['archive_path'], $contents);
        $zip->close();

        $this->expectException(DomainException::class);
        try {
            app(ServicePackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    private function service(array $attributes = []): array
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $service = Service::create([...[
            'user_id' => $admin->id, 'name' => 'Package Service', 'slug' => 'package-service',
            'excerpt' => 'Résumé', 'content' => '<p>Contenu</p>', 'status' => true,
        ], ...$attributes]);

        return [$admin, $service];
    }
}
