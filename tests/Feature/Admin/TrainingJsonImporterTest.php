<?php

namespace Tests\Feature\Admin;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizQuestion;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use App\Models\User;
use App\Services\TrainingContentImporter;
use App\Services\TrainingJsonExporter;
use App\Services\TrainingJsonImporter;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Tests\TestCase;

class TrainingJsonImporterTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_training_is_imported_with_complete_whitelisted_content(): void
    {
        $package = $this->package();
        $package['data']['participants'] = [['email' => 'secret@example.test']];
        $package['data']['payments'] = [['stripe_secret' => 'sk_secret']];

        $report = app(TrainingJsonImporter::class)->import(json_encode($package), 'formation.json');

        $training = Training::where('slug', 'formation-importee')->firstOrFail();
        $this->assertSame('Formation importée', $training->title);
        $this->assertSame('Contenu complet', $training->content);
        $this->assertSame('Genève', $training->location);
        $this->assertSame('149.50', $training->price);
        $this->assertSame(['original' => asset('storage/trainings/hero.jpg')], $training->featured_image);
        $this->assertSame(['management'], $training->tags);
        $this->assertSame(1, $report['created']['trainings']);
        $this->assertSame(1, $report['created']['sections']);
        $this->assertSame(1, $report['created']['lessons']);
        $this->assertSame(1, $report['created']['resources']);
        $this->assertSame(1, $report['created']['quizzes']);
        $this->assertSame(1, $report['created']['questions']);

        $section = $training->sections()->firstOrFail();
        $this->assertSame('Description section', $section->description);
        $this->assertSame(7, $section->sort_order);
        $lesson = $section->lessons()->firstOrFail();
        $this->assertSame('slug-fourni', $lesson->slug);
        $this->assertSame(8, $lesson->sort_order);
        $this->assertSame(['original' => 'lessons/thumb.jpg'], json_decode($lesson->thumbnail, true));
        $resource = $lesson->resources()->firstOrFail();
        $this->assertSame('training-resources/guide.pdf', $resource->file_path);
        $this->assertSame('private', $resource->file_disk);
        $this->assertSame(9, $resource->sort_order);
        $quiz = $section->quiz()->firstOrFail();
        $this->assertSame(80, $quiz->passing_score);
        $question = $quiz->questions()->firstOrFail();
        $this->assertSame(['Oui', 'Non'], $question->options);
        $this->assertSame(0, $question->correct_option_index);
        $this->assertSame(10, $question->sort_order);
        $this->assertNull($training->user_id);
        $this->assertDatabaseMissing('users', ['email' => 'secret@example.test']);
    }

    public function test_existing_slug_and_double_import_are_refused_without_extra_content(): void
    {
        $json = json_encode($this->package());
        $importer = app(TrainingJsonImporter::class);
        $importer->import($json);
        $counts = $this->counts();

        try {
            $importer->import($json);
            $this->fail('Le second import aurait dû être refusé.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('existe déjà', $exception->getMessage());
        }

        $this->assertSame($counts, $this->counts());
    }

    public function test_complete_import_rolls_back_when_nested_content_fails(): void
    {
        $owner = User::factory()->create();
        $other = Training::create([
            'user_id' => $owner->id, 'title' => 'Autre', 'slug' => 'autre', 'content' => 'x',
            'location' => 'x', 'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
        ]);
        $section = TrainingSection::create(['training_id' => $other->id, 'title' => 'S', 'sort_order' => 1]);
        TrainingLesson::create([
            'training_id' => $other->id, 'training_section_id' => $section->id,
            'title' => 'Conflit', 'slug' => 'slug-fourni', 'sort_order' => 1,
        ]);
        $before = $this->counts();

        try {
            app(TrainingJsonImporter::class)->import(json_encode($this->package()));
            $this->fail('Une contrainte de slug devait faire échouer l’import.');
        } catch (\Throwable) {
            $this->assertSame($before, $this->counts());
            $this->assertDatabaseMissing('trainings', ['slug' => 'formation-importee']);
        }
    }

    public function test_content_importer_can_populate_an_existing_training_directly(): void
    {
        $owner = User::factory()->create();
        $training = Training::create([
            'user_id' => $owner->id, 'title' => 'Cible', 'slug' => 'cible', 'content' => 'x',
            'location' => 'x', 'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
        ]);

        $counts = app(TrainingContentImporter::class)->import($training, $this->package()['data']['sections']);

        $this->assertSame(['sections' => 1, 'lessons' => 1, 'resources' => 1, 'quizzes' => 1, 'questions' => 1], $counts);
        $this->assertSame('slug-fourni', $training->lessons()->firstOrFail()->slug);
    }

    public function test_content_importer_rejects_invalid_correct_option(): void
    {
        $owner = User::factory()->create();
        $training = Training::create([
            'user_id' => $owner->id, 'title' => 'Cible', 'slug' => 'cible', 'content' => 'x',
            'location' => 'x', 'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
        ]);
        $sections = $this->package()['data']['sections'];
        $sections[0]['quiz']['questions'][0]['correct_option_index'] = 99;

        $this->expectException(InvalidArgumentException::class);
        app(TrainingContentImporter::class)->import($training, $sections);
    }

    public function test_export_import_round_trip_rebuilds_business_content_without_source_ids(): void
    {
        app(TrainingJsonImporter::class)->import(json_encode($this->package()));
        $source = Training::where('slug', 'formation-importee')->firstOrFail();
        $export = app(TrainingJsonExporter::class)->json($source);
        $expected = json_decode($export, true)['data'];
        $source->forceDelete();

        app(TrainingJsonImporter::class)->import($export);
        $rebuilt = Training::where('slug', 'formation-importee')->firstOrFail();
        $actual = app(TrainingJsonExporter::class)->package($rebuilt)['data'];

        $this->assertSame($expected, $actual);
    }

    public function test_endpoint_revalidates_file_and_enforces_admin_access(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $client = User::factory()->create(['role' => 'client', 'is_active' => 1]);
        $json = json_encode($this->package());

        $this->actingAs($client)->post(route('trainings.import-export.create'), [
            'file' => UploadedFile::fake()->createWithContent('training.json', $json),
            'status' => 'new',
        ])->assertForbidden();

        $this->actingAs($admin)->post(route('trainings.import-export.create'), [
            'file' => UploadedFile::fake()->createWithContent('training.json', $json),
            'status' => 'existing',
            'participants' => [['email' => 'ignored@example.test']],
        ])->assertRedirect(route('trainings.import-export'));

        $this->assertDatabaseHas('trainings', ['slug' => 'formation-importee']);
        $this->assertDatabaseMissing('users', ['email' => 'ignored@example.test']);
    }

    public function test_importer_rejects_invalid_json_wrong_type_and_wrong_version(): void
    {
        $payloads = [
            '{"schema_version":',
            json_encode(['schema_version' => '1.0', 'type' => 'service', 'data' => []]),
            json_encode(['schema_version' => '2.0', 'type' => 'training', 'data' => []]),
        ];

        foreach ($payloads as $payload) {
            try {
                app(TrainingJsonImporter::class)->import($payload);
                $this->fail('Le package invalide aurait dû être refusé.');
            } catch (ValidationException) {
                $this->assertSame(0, Training::count());
            }
        }
    }

    private function package(): array
    {
        return [
            'schema_version' => '1.0', 'type' => 'training', 'exported_at' => now()->toIso8601String(),
            'data' => [
                'title' => 'Formation importée', 'slug' => 'formation-importee', 'excerpt' => 'Résumé',
                'content' => 'Contenu complet', 'start_date' => now()->addMonth()->toIso8601String(),
                'end_date' => now()->addMonth()->addDay()->toIso8601String(), 'location' => 'Genève',
                'featured_image' => ['original' => 'trainings/hero.jpg'], 'max_participants' => 20,
                'price' => '149.50', 'is_published' => true, 'is_featured' => false,
                'published_at' => now()->toIso8601String(), 'tags' => ['management'],
                'meeting_link' => 'https://example.test/meeting',
                'sections' => [[
                    'title' => 'Module', 'description' => 'Description section', 'sort_order' => 7, 'is_published' => true,
                    'lessons' => [[
                        'title' => 'Leçon', 'slug' => 'slug-fourni', 'excerpt' => 'Résumé leçon', 'content' => 'Cours',
                        'video_url' => 'videos/local.mp4', 'video_duration' => 600,
                        'thumbnail' => ['original' => 'lessons/thumb.jpg'], 'sort_order' => 8,
                        'is_free' => true, 'is_published' => true,
                        'resources' => [[
                            'title' => 'Guide', 'description' => 'PDF', 'file_path' => 'training-resources/guide.pdf',
                            'external_url' => null, 'file_disk' => 'private', 'file_type' => 'pdf',
                            'is_downloadable' => true, 'is_public' => false, 'sort_order' => 9,
                        ]],
                    ]],
                    'quiz' => [
                        'title' => 'Quiz', 'description' => 'Validation', 'passing_score' => 80, 'is_published' => true,
                        'questions' => [[
                            'question' => 'Question ?', 'options' => ['Oui', 'Non'], 'correct_option_index' => 0,
                            'sort_order' => 10, 'points' => 2,
                        ]],
                    ],
                ]],
            ],
        ];
    }

    private function counts(): array
    {
        return [Training::count(), TrainingSection::count(), TrainingLesson::count(), TrainingResource::count(), TrainingQuiz::count(), TrainingQuizQuestion::count()];
    }
}
