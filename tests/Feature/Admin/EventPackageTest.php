<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Services\EventJsonImporter;
use App\Services\EventPackageAnalyzer;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class EventPackageTest extends TestCase
{
    use RefreshDatabase;

    public function test_http_export_contains_event_json_manifest_and_local_featured_image(): void
    {
        Storage::fake('public');
        [$admin, $event] = $this->event(['featured_image' => ['original' => 'events/affiche.jpg', 'external' => 'https://example.test/image.jpg']]);
        Storage::disk('public')->put('events/affiche.jpg', 'image-event');

        $response = $this->actingAs($admin)->get(route('events.export-package', $event));
        $response->assertOk()->assertDownload('redeemer-event-package-event.zip');
        $path = $response->baseResponse->getFile()->getPathname();
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($path) === true);
        $this->assertNotFalse($zip->locateName('event.json'));
        $this->assertNotFalse($zip->locateName('manifest.json'));
        $this->assertNotFalse($zip->locateName('media/events/affiche.jpg'));
        $manifest = json_decode($zip->getFromName('manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('event-package', $manifest['type']);
        $this->assertSame(hash('sha256', 'image-event'), $manifest['media']['files'][0]['sha256']);
        $this->assertCount(1, $manifest['media']['files']);
        $zip->close();
    }

    public function test_zip_analysis_is_read_only_and_reports_missing_media(): void
    {
        Storage::fake('public');
        [, $event] = $this->event(['featured_image' => 'events/missing.jpg']);
        $path = app(\App\Services\EventPackageExporter::class)->export($event);
        $before = $event->fresh()->toArray();

        $result = app(EventPackageAnalyzer::class)->analyze($path, 'event.zip');

        $this->assertTrue($result['analysis']['valid']);
        $this->assertSame(1, $result['package']['media_missing']);
        $this->assertSame($before, $event->fresh()->toArray());
        unlink($path);
    }

    public function test_zip_slip_absolute_paths_symlink_and_file_limit_are_rejected(): void
    {
        foreach (['../evil.txt', '/absolute.txt', 'C:/absolute.txt'] as $entry) {
            $path = $this->zip(['event.json' => '{}', 'manifest.json' => '{}', $entry => 'evil']);
            try {
                app(EventPackageAnalyzer::class)->analyze($path);
                $this->fail('Le chemin dangereux aurait dû être rejeté.');
            } catch (DomainException) {
                $this->assertTrue(true);
            } finally {
                unlink($path);
            }
        }

        $path = $this->zip(['event.json' => '{}', 'manifest.json' => '{}', 'media/link' => 'target']);
        $zip = new ZipArchive;
        $zip->open($path);
        $zip->setExternalAttributesName('media/link', ZipArchive::OPSYS_UNIX, (0120777 << 16));
        $zip->close();
        try {
            app(EventPackageAnalyzer::class)->analyze($path);
            $this->fail('Le lien symbolique aurait dû être rejeté.');
        } catch (DomainException) {
            $this->assertTrue(true);
        } finally {
            unlink($path);
        }

        config()->set('training-packages.max_files', 2);
        $path = $this->zip(['event.json' => '{}', 'manifest.json' => '{}', 'third.txt' => 'x']);
        $this->expectException(DomainException::class);
        try {
            app(EventPackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_hash_tampering_is_rejected(): void
    {
        Storage::fake('public');
        [, $event] = $this->event(['featured_image' => 'events/affiche.jpg']);
        Storage::disk('public')->put('events/affiche.jpg', 'source');
        $path = app(\App\Services\EventPackageExporter::class)->export($event);
        $zip = new ZipArchive;
        $zip->open($path);
        $zip->deleteName('media/events/affiche.jpg');
        $zip->addFromString('media/events/affiche.jpg', 'altéré');
        $zip->close();

        $this->expectException(DomainException::class);
        try {
            app(EventPackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_manifest_cannot_inject_a_media_not_referenced_by_featured_image(): void
    {
        Storage::fake('public');
        [, $event] = $this->event(['featured_image' => null]);
        $path = app(\App\Services\EventPackageExporter::class)->export($event);
        $zip = new ZipArchive;
        $zip->open($path);
        $manifest = json_decode($zip->getFromName('manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $contents = 'injection';
        $file = ['disk' => 'public', 'path' => 'events/injected.txt', 'archive_path' => 'media/events/injected.txt', 'size' => strlen($contents), 'sha256' => hash('sha256', $contents)];
        $manifest['media']['included'] = 1;
        $manifest['media']['files'] = [$file];
        $zip->deleteName('manifest.json');
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_THROW_ON_ERROR));
        $zip->addFromString($file['archive_path'], $contents);
        $zip->close();

        $this->expectException(DomainException::class);
        try {
            app(EventPackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_create_copies_media_and_update_reuses_identical_media_without_delete(): void
    {
        Storage::fake('public');
        [$admin, $event] = $this->event(['featured_image' => 'events/affiche.jpg']);
        Storage::disk('public')->put('events/affiche.jpg', 'source');
        $path = app(\App\Services\EventPackageExporter::class)->export($event);
        $event->forceDelete();
        Storage::disk('public')->delete('events/affiche.jpg');

        $created = app(\App\Services\EventPackageImporter::class)->import($path, 'create', $admin->id);
        $this->assertSame(['copied' => 1, 'reused' => 0, 'missing' => 0], $created['package_media']);
        $updated = app(\App\Services\EventPackageImporter::class)->import($path, 'update', $admin->id);
        $this->assertSame(['copied' => 0, 'reused' => 1, 'missing' => 0], $updated['package_media']);
        $this->assertSame(0, $updated['deleted']);
        Storage::disk('public')->assertExists('events/affiche.jpg');
        unlink($path);
    }

    public function test_collision_never_overwrites_existing_media(): void
    {
        Storage::fake('public');
        [$admin, $event] = $this->event(['featured_image' => 'events/affiche.jpg']);
        Storage::disk('public')->put('events/affiche.jpg', 'source');
        $path = app(\App\Services\EventPackageExporter::class)->export($event);
        $event->forceDelete();
        Storage::disk('public')->put('events/affiche.jpg', 'collision');

        $this->expectException(DomainException::class);
        try {
            app(\App\Services\EventPackageImporter::class)->import($path, 'create', $admin->id);
        } finally {
            $this->assertSame('collision', Storage::disk('public')->get('events/affiche.jpg'));
            unlink($path);
        }
    }

    public function test_copied_media_is_removed_when_database_import_fails(): void
    {
        Storage::fake('public');
        [$admin, $event] = $this->event(['featured_image' => 'events/affiche.jpg']);
        Storage::disk('public')->put('events/affiche.jpg', 'source');
        $path = app(\App\Services\EventPackageExporter::class)->export($event);
        $event->forceDelete();
        Storage::disk('public')->delete('events/affiche.jpg');
        $this->mock(EventJsonImporter::class)->shouldReceive('import')->once()->andThrow(new DomainException('Échec DB simulé'));

        try {
            app(\App\Services\EventPackageImporter::class)->import($path, 'create', $admin->id);
            $this->fail('L’échec simulé aurait dû être propagé.');
        } catch (DomainException $exception) {
            $this->assertSame('Échec DB simulé', $exception->getMessage());
            Storage::disk('public')->assertMissing('events/affiche.jpg');
        } finally {
            unlink($path);
        }
    }

    private function event(array $attributes = []): array
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = Category::create(['name' => 'Conférences', 'slug' => 'conferences']);
        DB::table('event_categories')->insert([
            'id' => $category->id, 'name' => $category->name, 'slug' => $category->slug,
            'description' => null, 'color' => '#000000', 'created_at' => now(), 'updated_at' => now(),
        ]);
        $event = Event::create([...[
            'user_id' => $admin->id, 'category_id' => $category->id, 'title' => 'Package Event',
            'slug' => 'package-event', 'description' => 'Description', 'content' => '<p>Contenu</p>',
            'location' => 'Genève', 'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
            'price' => 0, 'max_participants' => 20, 'is_published' => true, 'is_featured' => false,
            'tags' => ['event'],
        ], ...$attributes]);

        return [$admin, $event];
    }

    private function zip(array $entries): string
    {
        $path = tempnam(sys_get_temp_dir(), 'unsafe-event-package-');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        foreach ($entries as $name => $contents) {
            $zip->addFromString($name, $contents);
        }
        $zip->close();

        return $path;
    }
}
