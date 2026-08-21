<?php

namespace Tests\Feature\Admin;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use App\Models\User;
use App\Services\TrainingJsonImporter;
use App\Services\TrainingPackageAnalyzer;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class TrainingPackageTest extends TestCase
{
    use RefreshDatabase;

    public function test_http_zip_export_contains_json_manifest_and_media_and_can_be_analyzed(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        Storage::disk('public')->put('trainings/équipe.jpg', 'image-binaire');
        Storage::disk('public')->put('training-resources/guide.pdf', '%PDF contenu');

        $response = $this->actingAs($admin)->get(route('trainings.export-package', $training));
        $response->assertOk()->assertDownload('redeemer-training-package-medias.zip');
        $path = $response->baseResponse->getFile()->getPathname();
        $body = file_get_contents($path);
        $uploaded = UploadedFile::fake()->createWithContent('package.zip', $body);

        $analysis = $this->actingAs($admin)->post(route('trainings.import-export.analyze'), ['file' => $uploaded]);
        $analysis->assertRedirect(route('trainings.import-export'));
        $this->followRedirects($analysis)->assertInertia(fn ($page) => $page
            ->where('analysis.valid', true)
            ->where('analysis.status', 'existing')
            ->where('analysis.package.integrity', 'ok')
            ->where('analysis.package.media_included', 2)
            ->where('analysis.package.media_missing', 0));

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($path) === true);
        $this->assertNotFalse($zip->locateName('training.json'));
        $this->assertNotFalse($zip->locateName('manifest.json'));
        $manifest = json_decode($zip->getFromName('manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame(hash('sha256', 'image-binaire'), collect($manifest['media']['files'])->firstWhere('path', 'trainings/équipe.jpg')['sha256']);
        $zip->close();
    }

    public function test_missing_media_is_reported_without_blocking_analysis(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        $path = app(\App\Services\TrainingPackageExporter::class)->export($training);

        $result = app(TrainingPackageAnalyzer::class)->analyze($path, 'missing.zip');

        $this->assertTrue($result['analysis']['valid']);
        $this->assertSame(2, $result['package']['media_missing']);
        $this->assertNotEmpty($result['analysis']['warnings']);
        unlink($path);
    }

    public function test_zip_slip_absolute_paths_hash_tampering_and_limits_are_rejected(): void
    {
        foreach (['../evil.txt', '/absolute.txt', 'C:/absolute.txt'] as $entry) {
            $path = $this->zip(['training.json' => '{}', 'manifest.json' => '{}', $entry => 'evil']);
            try {
                app(TrainingPackageAnalyzer::class)->analyze($path);
                $this->fail("Le chemin {$entry} aurait dû être rejeté.");
            } catch (DomainException) {
                $this->assertTrue(true);
            } finally {
                unlink($path);
            }
        }

        config()->set('training-packages.max_files', 2);
        $path = $this->zip(['training.json' => '{}', 'manifest.json' => '{}', 'third.txt' => 'x']);
        $this->expectException(DomainException::class);
        try {
            app(TrainingPackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_symbolic_link_entry_is_rejected(): void
    {
        $path = $this->zip(['training.json' => '{}', 'manifest.json' => '{}', 'media/link' => 'target']);
        $zip = new ZipArchive;
        $zip->open($path);
        $zip->setExternalAttributesName('media/link', ZipArchive::OPSYS_UNIX, (0120777 << 16));
        $zip->close();

        $this->expectException(DomainException::class);
        try {
            app(TrainingPackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_different_existing_media_collision_blocks_import_without_overwrite(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        Storage::disk('public')->put('trainings/équipe.jpg', 'source');
        Storage::disk('public')->put('training-resources/guide.pdf', 'guide');
        $path = app(\App\Services\TrainingPackageExporter::class)->export($training);
        $training->forceDelete();
        Storage::disk('public')->put('trainings/équipe.jpg', 'collision');

        $this->expectException(DomainException::class);
        try {
            app(\App\Services\TrainingPackageImporter::class)->import($path, 'create');
        } finally {
            $this->assertSame('collision', Storage::disk('public')->get('trainings/équipe.jpg'));
            unlink($path);
        }
    }

    public function test_new_training_import_copies_media_and_identical_files_are_reused(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        Storage::disk('public')->put('trainings/équipe.jpg', 'source');
        Storage::disk('public')->put('training-resources/guide.pdf', 'guide');
        $path = app(\App\Services\TrainingPackageExporter::class)->export($training);
        $training->forceDelete();
        Storage::disk('public')->delete('training-resources/guide.pdf');

        $result = app(\App\Services\TrainingPackageImporter::class)->import($path, 'create');

        $this->assertDatabaseHas('trainings', ['slug' => 'package-medias']);
        $this->assertSame(['copied' => 1, 'reused' => 1, 'missing' => 0], $result['package_media']);
        Storage::disk('public')->assertExists('training-resources/guide.pdf');
        unlink($path);
    }

    public function test_media_hash_tampering_is_rejected(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        Storage::disk('public')->put('trainings/équipe.jpg', 'source');
        Storage::disk('public')->put('training-resources/guide.pdf', 'guide');
        $path = app(\App\Services\TrainingPackageExporter::class)->export($training);
        $zip = new ZipArchive;
        $zip->open($path);
        $zip->deleteName('media/trainings/équipe.jpg');
        $zip->addFromString('media/trainings/équipe.jpg', 'altéré');
        $zip->close();

        $this->expectException(DomainException::class);
        try {
            app(TrainingPackageAnalyzer::class)->analyze($path);
        } finally {
            unlink($path);
        }
    }

    public function test_existing_training_package_update_reuses_identical_media(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        Storage::disk('public')->put('trainings/équipe.jpg', 'source');
        Storage::disk('public')->put('training-resources/guide.pdf', 'guide');
        $path = app(\App\Services\TrainingPackageExporter::class)->export($training);

        $result = app(\App\Services\TrainingPackageImporter::class)->import($path, 'update');

        $this->assertSame(['copied' => 0, 'reused' => 2, 'missing' => 0], $result['package_media']);
        $this->assertSame(0, $result['deleted']);
        unlink($path);
    }

    public function test_new_media_are_removed_when_database_import_fails(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = $this->training($admin);
        Storage::disk('public')->put('trainings/équipe.jpg', 'source');
        Storage::disk('public')->put('training-resources/guide.pdf', 'guide');
        $path = app(\App\Services\TrainingPackageExporter::class)->export($training);
        $training->forceDelete();
        Storage::disk('public')->delete(['trainings/équipe.jpg', 'training-resources/guide.pdf']);
        $this->mock(TrainingJsonImporter::class)
            ->shouldReceive('import')
            ->once()
            ->andThrow(new DomainException('Échec DB simulé'));

        try {
            app(\App\Services\TrainingPackageImporter::class)->import($path, 'create');
            $this->fail('L’échec simulé aurait dû être propagé.');
        } catch (DomainException $exception) {
            $this->assertSame('Échec DB simulé', $exception->getMessage());
            Storage::disk('public')->assertMissing('trainings/équipe.jpg');
            Storage::disk('public')->assertMissing('training-resources/guide.pdf');
        } finally {
            unlink($path);
        }
    }

    private function training(User $admin): Training
    {
        $training = Training::create([
            'user_id' => $admin->id, 'title' => 'Package médias', 'slug' => 'package-medias',
            'content' => '<p>Équipe « Unicode »</p>', 'location' => 'Genève',
            'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
            'featured_image' => ['original' => 'trainings/équipe.jpg'],
            'price' => 0,
        ]);
        $section = TrainingSection::create(['training_id' => $training->id, 'title' => 'Section', 'sort_order' => 1]);
        $lesson = TrainingLesson::create(['training_id' => $training->id, 'training_section_id' => $section->id, 'title' => 'Leçon', 'slug' => 'lecon', 'content' => 'Texte', 'sort_order' => 1]);
        TrainingResource::create(['training_lesson_id' => $lesson->id, 'title' => 'Guide', 'file_path' => 'training-resources/guide.pdf', 'file_disk' => 'public', 'sort_order' => 1]);

        return $training;
    }

    private function zip(array $entries): string
    {
        $path = tempnam(sys_get_temp_dir(), 'unsafe-package-');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        foreach ($entries as $name => $contents) {
            $zip->addFromString($name, $contents);
        }
        $zip->close();

        return $path;
    }
}
