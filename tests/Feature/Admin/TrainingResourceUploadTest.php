<?php

namespace Tests\Feature\Admin;

use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\RequireAdminAccess;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TrainingResourceUploadTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        try {
            $this->artisan('migrate:fresh');
        } catch (\RuntimeException $exception) {
            if (str_contains($exception->getMessage(), 'does not support dropping foreign keys by name')) {
                $this->markTestSkipped('Migrations sqlite incompatibles dans ce projet (dropForeign par nom).');
            }

            throw $exception;
        }

        $this->withoutMiddleware([
            RequireAdminAccess::class,
            EnsureUserIsActive::class,
        ]);
    }

    public function test_admin_can_upload_resource_without_title_and_title_is_generated_from_filename(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => 1,
        ]);

        $training = Training::create([
            'title' => 'Formation test',
            'slug' => 'formation-test',
            'excerpt' => 'Extrait',
            'content' => 'Contenu',
            'location' => 'Online',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => 100,
            'is_published' => true,
            'published_at' => now(),
            'user_id' => $admin->id,
        ]);

        $section = TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'Section 1',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $lesson = TrainingLesson::create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'Lecon 1',
            'slug' => 'lecon-1',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $response = $this->actingAs($admin)->post(
            route('trainings.lessons.resources.store', [
                'training' => $training->id,
                'lesson' => $lesson->id,
            ]),
            [
                'title' => '',
                'description' => 'Ressource test',
                'file_type' => 'pdf',
                'file' => UploadedFile::fake()->create('guide-demarrage.pdf', 128, 'application/pdf'),
                'is_downloadable' => true,
                'is_public' => false,
                'sort_order' => 1,
            ]
        );

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();

        $resource = TrainingResource::query()->first();

        $this->assertNotNull($resource);
        $this->assertSame($lesson->id, $resource->training_lesson_id);
        $this->assertSame('guide-demarrage', $resource->title);
        $this->assertSame('pdf', $resource->file_type);
        $this->assertNotNull($resource->file_path);

        Storage::disk('public')->assertExists($resource->file_path);
    }
}
