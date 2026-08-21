<?php

namespace Tests\Feature\Admin;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizQuestion;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use App\Models\User;
use App\Services\TrainingJsonExporter;
use App\Services\TrainingJsonImportAnalyzer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TrainingJsonImportAnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_real_export_can_be_analyzed_round_trip_without_significant_changes(): void
    {
        $training = $this->trainingWithContent();
        $json = app(TrainingJsonExporter::class)->json($training);

        $result = app(TrainingJsonImportAnalyzer::class)->analyze($json, 'round-trip.json');

        $this->assertTrue($result['valid']);
        $this->assertSame('existing', $result['status']);
        $this->assertSame(0, $result['summary']['changes']);
        $this->assertSame(0, collect($result['changes'])->where('status', 'modified')->count());
        $this->assertSame(1, $result['relation_changes']['sections']['unchanged']);
        $this->assertSame(1, $result['relation_changes']['lessons']['unchanged']);
        $this->assertSame(1, $result['relation_changes']['resources']['unchanged']);
        $this->assertSame(1, $result['relation_changes']['quizzes']['unchanged']);
        $this->assertSame(1, $result['relation_changes']['questions']['unchanged']);
    }

    public function test_unknown_slug_is_reported_as_new(): void
    {
        $package = $this->minimalPackage(['slug' => 'nouvelle-formation']);

        $result = app(TrainingJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertTrue($result['valid']);
        $this->assertSame('new', $result['status']);
    }

    public function test_existing_training_and_field_differences_are_detected(): void
    {
        $training = $this->trainingWithContent();
        $package = app(TrainingJsonExporter::class)->package($training);
        $package['data']['title'] = 'Titre modifié';
        $package['data']['price'] = '199.00';

        $result = app(TrainingJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertSame('existing', $result['status']);
        $this->assertSame(['title', 'price'], collect($result['changes'])->where('status', 'modified')->pluck('field')->all());
        $this->assertSame(2, $result['summary']['changes']);
    }

    #[DataProvider('invalidPackageProvider')]
    public function test_invalid_packages_are_rejected(string $json, string $expectedError): void
    {
        $result = app(TrainingJsonImportAnalyzer::class)->analyze($json);

        $this->assertFalse($result['valid']);
        $this->assertSame('invalid', $result['status']);
        $this->assertStringContainsString($expectedError, implode(' ', $result['errors']));
    }

    public static function invalidPackageProvider(): array
    {
        return [
            'syntax' => ['{"schema_version":', 'syntaxe'],
            'wrong type' => [json_encode(['schema_version' => '1.0', 'type' => 'service', 'data' => []]), 'type "service"'],
            'wrong version' => [json_encode(['schema_version' => '2.0', 'type' => 'training', 'data' => []]), 'pas supportée'],
            'missing slug' => [json_encode(['schema_version' => '1.0', 'type' => 'training', 'data' => ['title' => 'Sans slug']]), 'slug'],
        ];
    }

    public function test_sensitive_unknown_fields_are_ignored_and_nothing_is_persisted(): void
    {
        $training = $this->trainingWithContent();
        $package = app(TrainingJsonExporter::class)->package($training);
        $package['data']['participants'] = [['email' => 'secret@example.test']];
        $package['data']['payments'] = [['stripe_secret' => 'sk_secret']];
        $counts = $this->contentCounts();

        $result = app(TrainingJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertTrue($result['valid']);
        $this->assertNotEmpty($result['warnings']);
        $this->assertSame($counts, $this->contentCounts());
        $this->assertDatabaseMissing('users', ['email' => 'secret@example.test']);
    }

    public function test_admin_can_upload_json_for_analysis_and_non_admin_cannot(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $client = User::factory()->create(['role' => 'client', 'is_active' => 1]);
        $json = json_encode($this->minimalPackage(['slug' => 'upload-test']));

        $response = $this->actingAs($admin)
            ->post(route('trainings.import-export.analyze'), [
                'file' => UploadedFile::fake()->createWithContent('training.json', $json),
            ]);

        $response->assertRedirect(route('trainings.import-export'));
        $this->followRedirects($response)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('backend/trainings/import-export', false)
                ->url('/dashboard/trainings/import-export')
                ->where('analysis.valid', true)
                ->where('analysis.status', 'new'));

        $this->actingAs($admin)
            ->get('/dashboard/trainings/import-export/analyze')
            ->assertMethodNotAllowed();

        $this->actingAs($client)
            ->post(route('trainings.import-export.analyze'), [
                'file' => UploadedFile::fake()->createWithContent('training.json', $json),
            ])
            ->assertForbidden();
    }

    public function test_upload_rejects_non_json_extension_and_empty_json_is_reported_cleanly(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);

        $this->actingAs($admin)
            ->from(route('trainings.import-export'))
            ->post(route('trainings.import-export.analyze'), [
                'file' => UploadedFile::fake()->createWithContent('training.txt', '{}'),
            ])
            ->assertRedirect(route('trainings.import-export'))
            ->assertSessionHasErrors('file');

        $response = $this->actingAs($admin)
            ->post(route('trainings.import-export.analyze'), [
                'file' => UploadedFile::fake()->createWithContent('training.json', ''),
            ]);

        $response->assertRedirect(route('trainings.import-export'));
        $this->followRedirects($response)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->url('/dashboard/trainings/import-export')
                ->where('analysis.valid', false)
                ->where('analysis.errors.0', 'Le fichier JSON est vide.'));
    }

    public function test_existing_training_analysis_returns_to_the_canonical_page_without_creation_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        Training::create([
            'user_id' => $admin->id,
            'title' => 'Déjà présente',
            'slug' => 'formation-existante',
            'content' => 'Contenu',
            'location' => 'Genève',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
        ]);
        $json = json_encode($this->minimalPackage(['slug' => 'formation-existante']));

        $response = $this->actingAs($admin)->post(route('trainings.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('training.json', $json),
        ]);

        $response->assertRedirect(route('trainings.import-export'));
        $this->followRedirects($response)->assertInertia(fn ($page) => $page
            ->url('/dashboard/trainings/import-export')
            ->where('analysis.valid', true)
            ->where('analysis.status', 'existing'));
    }

    private function trainingWithContent(): Training
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = Training::create([
            'user_id' => $admin->id,
            'title' => 'Formation source',
            'slug' => 'formation-source',
            'excerpt' => 'Résumé',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'start_date' => now()->addMonth()->startOfMinute(),
            'end_date' => now()->addMonth()->addDay()->startOfMinute(),
            'price' => 125,
            'is_published' => true,
            'published_at' => now()->startOfMinute(),
        ]);
        $section = TrainingSection::create([
            'training_id' => $training->id, 'title' => 'Section', 'description' => 'Description',
            'sort_order' => 1, 'is_published' => true,
        ]);
        $lesson = TrainingLesson::create([
            'training_id' => $training->id, 'training_section_id' => $section->id,
            'title' => 'Leçon', 'slug' => 'lecon', 'content' => 'Cours',
            'sort_order' => 1, 'is_free' => false, 'is_published' => true,
        ]);
        TrainingResource::create([
            'training_lesson_id' => $lesson->id, 'title' => 'Document',
            'external_url' => 'https://example.test/guide', 'file_disk' => 'public',
            'is_downloadable' => true, 'is_public' => false, 'sort_order' => 1,
        ]);
        $quiz = TrainingQuiz::create([
            'training_id' => $training->id, 'training_section_id' => $section->id,
            'title' => 'Quiz', 'passing_score' => 70, 'is_published' => true,
        ]);
        TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id, 'question' => 'Question ?',
            'options' => ['A', 'B'], 'correct_option_index' => 0, 'sort_order' => 1, 'points' => 1,
        ]);

        return $training;
    }

    private function minimalPackage(array $overrides = []): array
    {
        return [
            'schema_version' => '1.0',
            'type' => 'training',
            'exported_at' => now()->toIso8601String(),
            'data' => array_merge([
                'title' => 'Formation test',
                'slug' => 'formation-test',
                'sections' => [],
            ], $overrides),
        ];
    }

    private function contentCounts(): array
    {
        return [
            Training::count(), TrainingSection::count(), TrainingLesson::count(),
            TrainingResource::count(), TrainingQuiz::count(), TrainingQuizQuestion::count(),
        ];
    }
}
