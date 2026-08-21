<?php

namespace Tests\Feature\Admin;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingSection;
use App\Models\User;
use App\Services\TrainingContentImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Mockery\MockInterface;
use RuntimeException;
use Tests\TestCase;

class LegacyTrainingContentImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_json_adds_sections_lessons_and_resources_through_the_shared_contract(): void
    {
        $training = $this->training();
        TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'Existant',
            'sort_order' => 4,
        ]);

        $response = $this->actingAs($this->admin())->post(route('trainings.import-sections', $training), [
            'file' => $this->jsonFile($this->legacyPayload()),
            'participants' => [['email' => 'ignored@example.test']],
            'payments' => [['stripe_secret' => 'sk_secret']],
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();
        $response->assertSessionHas('success', '✓ 1 module(s) et leurs leçons importés avec succès.');

        $section = $training->sections()->where('title', 'Module historique')->firstOrFail();
        $this->assertSame(9, $section->sort_order);
        $this->assertSame('Description module', $section->description);

        $lesson = $section->lessons()->firstOrFail();
        $this->assertSame('slug-fourni', $lesson->slug);
        $this->assertSame(8, $lesson->sort_order);
        $this->assertTrue($lesson->is_free);

        $resource = $lesson->resources()->firstOrFail();
        $this->assertSame(7, $resource->sort_order);
        $this->assertSame('private', $resource->file_disk);
        $this->assertSame('docs/guide.pdf', $resource->file_path);
        $this->assertDatabaseMissing('users', ['email' => 'ignored@example.test']);
    }

    public function test_missing_orders_and_slug_receive_legacy_compatible_fallbacks(): void
    {
        $training = $this->training();
        TrainingSection::create(['training_id' => $training->id, 'title' => 'Existant', 'sort_order' => 12]);
        $payload = $this->legacyPayload();
        unset($payload['sections'][0]['sort_order'], $payload['sections'][0]['lessons'][0]['sort_order']);
        unset($payload['sections'][0]['lessons'][0]['slug']);
        unset($payload['sections'][0]['lessons'][0]['resources'][0]['sort_order']);

        $this->actingAs($this->admin())->post(route('trainings.import-sections', $training), [
            'file' => $this->jsonFile($payload),
        ])->assertSessionHasNoErrors();

        $section = $training->sections()->where('title', 'Module historique')->firstOrFail();
        $this->assertSame(13, $section->sort_order);
        $lesson = $section->lessons()->firstOrFail();
        $this->assertSame('lecon-historique', $lesson->slug);
        $this->assertSame(1, $lesson->sort_order);
        $this->assertSame(1, $lesson->resources()->firstOrFail()->sort_order);
    }

    public function test_invalid_json_structure_and_slug_collision_are_refused_without_partial_content(): void
    {
        $training = $this->training();
        $other = $this->training('autre');
        $otherSection = TrainingSection::create([
            'training_id' => $other->id,
            'title' => 'Autre section',
            'sort_order' => 1,
        ]);
        TrainingLesson::create([
            'training_id' => $other->id,
            'training_section_id' => $otherSection->id,
            'title' => 'Conflit',
            'slug' => 'slug-fourni',
            'sort_order' => 1,
        ]);

        foreach (['{"sections":', json_encode(['sections' => [['lessons' => []]]]), json_encode($this->legacyPayload())] as $json) {
            $before = TrainingSection::count();

            $this->actingAs($this->admin())->post(route('trainings.import-sections', $training), [
                'file' => UploadedFile::fake()->createWithContent('contenu.json', $json),
            ])->assertSessionHasErrors('file');

            $this->assertSame($before, TrainingSection::count());
        }
    }

    public function test_endpoint_owns_the_transaction_and_rolls_back_a_shared_importer_failure(): void
    {
        $training = $this->training();
        $this->mock(TrainingContentImporter::class, function (MockInterface $mock): void {
            $mock->shouldReceive('import')->once()->andReturnUsing(function (Training $target): never {
                TrainingSection::create(['training_id' => $target->id, 'title' => 'Partiel', 'sort_order' => 1]);
                throw new RuntimeException('échec imbriqué');
            });
        });

        $this->actingAs($this->admin())->post(route('trainings.import-sections', $training), [
            'file' => $this->jsonFile($this->legacyPayload()),
        ])->assertSessionHasErrors('file');

        $this->assertDatabaseMissing('training_sections', ['training_id' => $training->id, 'title' => 'Partiel']);
    }

    public function test_non_admin_cannot_use_the_legacy_content_endpoint(): void
    {
        $client = User::factory()->create(['role' => 'client', 'is_active' => 1]);

        $this->actingAs($client)->post(route('trainings.import-sections', $this->training()), [
            'file' => $this->jsonFile($this->legacyPayload()),
        ])->assertForbidden();
    }

    private function legacyPayload(): array
    {
        return [
            'sections' => [[
                'title' => 'Module historique',
                'description' => 'Description module',
                'sort_order' => 9,
                'lessons' => [[
                    'title' => 'Leçon historique',
                    'slug' => 'slug-fourni',
                    'excerpt' => 'Résumé',
                    'content' => '<p>Contenu</p>',
                    'video_url' => 'https://example.test/video',
                    'video_duration' => 600,
                    'sort_order' => 8,
                    'is_published' => true,
                    'is_free' => true,
                    'resources' => [[
                        'title' => 'Guide',
                        'description' => 'Ressource',
                        'external_url' => 'https://example.test/guide',
                        'file_path' => 'docs/guide.pdf',
                        'file_disk' => 'private',
                        'file_type' => 'pdf',
                        'is_downloadable' => true,
                        'is_public' => false,
                        'sort_order' => 7,
                    ]],
                ]],
            ]],
            'users' => [['email' => 'ignored@example.test']],
            'payments' => [['stripe_secret' => 'sk_secret']],
        ];
    }

    private function jsonFile(array $payload): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('contenu.json', json_encode($payload));
    }

    private function training(string $slug = 'formation-cible'): Training
    {
        return Training::create([
            'user_id' => User::factory()->create()->id,
            'title' => Str::headline($slug),
            'slug' => $slug,
            'content' => 'Contenu',
            'location' => 'Genève',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => 1]);
    }
}
