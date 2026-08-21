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
use App\Services\TrainingJsonImporter;
use App\Services\TrainingJsonUpdateApplier;
use App\Services\TrainingJsonUpdatePlanner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Tests\TestCase;

class TrainingStableIdTest extends TestCase
{
    use RefreshDatabase;

    public function test_models_generate_unique_stable_ids_automatically(): void
    {
        [$training, $section, $lesson, $quiz] = $this->baseContent();
        $resource = TrainingResource::create([
            'training_lesson_id' => $lesson->id, 'title' => 'Guide', 'sort_order' => 1,
        ]);
        $question = TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id, 'question' => 'Question ?',
            'options' => ['A'], 'correct_option_index' => 0,
        ]);
        $otherSection = TrainingSection::create([
            'training_id' => $training->id, 'title' => 'Autre', 'sort_order' => 2,
        ]);

        foreach ([$section->stable_id, $resource->stable_id, $question->stable_id] as $stableId) {
            $this->assertTrue(Str::isUuid($stableId));
        }
        $this->assertNotSame($section->stable_id, $otherSection->stable_id);
    }

    public function test_migration_backfills_existing_rows_portably(): void
    {
        [$training, $section, $lesson, $quiz] = $this->baseContent();
        $migration = require database_path('migrations/2026_08_21_220000_add_stable_ids_to_training_content.php');
        $migration->down();

        DB::table('training_sections')->insert([
            'training_id' => $training->id, 'title' => 'Sans identifiant', 'sort_order' => 8,
            'is_published' => true, 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('training_resources')->insert([
            'training_lesson_id' => $lesson->id, 'title' => 'Sans identifiant',
            'file_disk' => 'public', 'is_downloadable' => true, 'is_public' => false,
            'sort_order' => 8, 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('training_quiz_questions')->insert([
            'training_quiz_id' => $quiz->id, 'question' => 'Sans identifiant ?',
            'options' => json_encode(['A']), 'correct_option_index' => 0,
            'sort_order' => 8, 'points' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $migration->up();

        foreach (['training_sections', 'training_resources', 'training_quiz_questions'] as $table) {
            $ids = DB::table($table)->pluck('stable_id');
            $this->assertNotEmpty($ids);
            $this->assertSame($ids->count(), $ids->unique()->count());
            $this->assertTrue($ids->every(fn ($id) => Str::isUuid($id)));
        }
    }

    public function test_stable_ids_make_renames_reorders_and_rewording_updates(): void
    {
        [$training, $section, $lesson, $quiz] = $this->baseContent();
        $resource = TrainingResource::create([
            'training_lesson_id' => $lesson->id, 'title' => 'Guide', 'sort_order' => 1,
        ]);
        $question = TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id, 'question' => 'Quelle est la bonne réponse ?',
            'options' => ['A', 'B'], 'correct_option_index' => 0, 'sort_order' => 1,
        ]);
        $package = app(TrainingJsonExporter::class)->package($training->fresh());
        $package['data']['sections'][0]['title'] = 'Démarrage';
        $package['data']['sections'][0]['sort_order'] = 3;
        $package['data']['sections'][0]['lessons'][0]['resources'][0]['title'] = 'Guide participant';
        $package['data']['sections'][0]['quiz']['questions'][0]['question'] = 'Quelle réponse est correcte ?';
        $package['data']['sections'][0]['quiz']['questions'][0]['sort_order'] = 3;

        $plan = app(TrainingJsonUpdatePlanner::class)->plan($package);

        $this->assertSame('UPDATE', $plan['content']['sections'][0]['action']);
        $this->assertSame('UPDATE', $plan['content']['sections'][0]['lessons'][0]['resources'][0]['action']);
        $this->assertSame('UPDATE', $plan['content']['sections'][0]['quiz']['questions'][0]['action']);
        $this->assertSame(0, $plan['summary']['creates']);
        $this->assertSame(0, $plan['summary']['ambiguous']);

        app(TrainingJsonUpdateApplier::class)->apply(json_encode($package));

        $this->assertSame('Démarrage', $section->fresh()->title);
        $this->assertSame(3, $section->fresh()->sort_order);
        $this->assertSame('Guide participant', $resource->fresh()->title);
        $this->assertSame('Quelle réponse est correcte ?', $question->fresh()->question);
        $this->assertSame(3, $question->fresh()->sort_order);
    }

    public function test_cross_hierarchy_stable_id_collision_is_ambiguous_and_not_applied(): void
    {
        [$training] = $this->baseContent();
        [$otherTraining, $otherSection] = $this->baseContent('autre-formation');
        $package = app(TrainingJsonExporter::class)->package($training);
        $package['data']['sections'][0]['stable_id'] = $otherSection->stable_id;

        $plan = app(TrainingJsonUpdatePlanner::class)->plan($package);

        $this->assertFalse($plan['can_apply']);
        $this->assertSame('AMBIGUOUS', $plan['content']['sections'][0]['action']);
        $this->assertSame($otherTraining->id, $otherSection->fresh()->training_id);
    }

    public function test_new_import_preserves_supplied_stable_ids_round_trip(): void
    {
        $sectionId = (string) Str::uuid();
        $resourceId = (string) Str::uuid();
        $questionId = (string) Str::uuid();
        $package = $this->portablePackage($sectionId, $resourceId, $questionId);

        app(TrainingJsonImporter::class)->import(json_encode($package));
        $exported = app(TrainingJsonExporter::class)->package(
            Training::where('slug', 'portable')->firstOrFail()
        );

        $this->assertSame('1.1', $exported['schema_version']);
        $this->assertSame($sectionId, $exported['data']['sections'][0]['stable_id']);
        $this->assertSame($resourceId, $exported['data']['sections'][0]['lessons'][0]['resources'][0]['stable_id']);
        $this->assertSame($questionId, $exported['data']['sections'][0]['quiz']['questions'][0]['stable_id']);
        $this->assertArrayNotHasKey('id', $exported['data']['sections'][0]);
    }

    public function test_invalid_or_colliding_stable_ids_are_rejected_without_partial_import(): void
    {
        [, $existingSection] = $this->baseContent();
        $package = $this->portablePackage(
            $existingSection->stable_id,
            (string) Str::uuid(),
            (string) Str::uuid()
        );
        $before = $this->counts();

        try {
            app(TrainingJsonImporter::class)->import(json_encode($package));
            $this->fail('La collision de stable_id aurait dû être refusée.');
        } catch (InvalidArgumentException $exception) {
            $this->assertStringContainsString('identifiant stable', $exception->getMessage());
        }
        $this->assertSame($before, $this->counts());

        $package['data']['sections'][0]['stable_id'] = 'not-a-uuid';
        $analysis = app(TrainingJsonImportAnalyzer::class)->analyze(json_encode($package));
        $this->assertFalse($analysis['valid']);
        $this->assertStringContainsString('UUID valide', implode(' ', $analysis['errors']));
    }

    private function baseContent(string $slug = 'formation-source'): array
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $training = Training::create([
            'user_id' => $user->id, 'title' => $slug, 'slug' => $slug, 'content' => 'Contenu',
            'location' => 'Genève', 'start_date' => now()->addMonth(), 'end_date' => now()->addMonth()->addDay(),
        ]);
        $section = TrainingSection::create([
            'training_id' => $training->id, 'title' => 'Introduction', 'sort_order' => 1,
        ]);
        $lesson = TrainingLesson::create([
            'training_id' => $training->id, 'training_section_id' => $section->id,
            'title' => 'Leçon', 'slug' => $slug.'-lecon', 'sort_order' => 1,
        ]);
        $quiz = TrainingQuiz::create([
            'training_id' => $training->id, 'training_section_id' => $section->id,
            'title' => 'Quiz', 'passing_score' => 70,
        ]);

        return [$training, $section, $lesson, $quiz];
    }

    private function portablePackage(string $sectionId, string $resourceId, string $questionId): array
    {
        return [
            'schema_version' => '1.1', 'type' => 'training', 'exported_at' => now()->toIso8601String(),
            'data' => [
                'title' => 'Portable', 'slug' => 'portable', 'content' => 'Contenu',
                'location' => 'Genève', 'start_date' => now()->addMonth()->toIso8601String(),
                'end_date' => now()->addMonth()->addDay()->toIso8601String(),
                'sections' => [[
                    'stable_id' => $sectionId, 'title' => 'Section', 'sort_order' => 1,
                    'lessons' => [[
                        'title' => 'Leçon', 'slug' => 'portable-lecon', 'sort_order' => 1,
                        'resources' => [[
                            'stable_id' => $resourceId, 'title' => 'Guide', 'sort_order' => 1,
                        ]],
                    ]],
                    'quiz' => [
                        'title' => 'Quiz', 'questions' => [[
                            'stable_id' => $questionId, 'question' => 'Question ?', 'options' => ['A'],
                            'correct_option_index' => 0, 'sort_order' => 1, 'points' => 1,
                        ]],
                    ],
                ]],
            ],
        ];
    }

    private function counts(): array
    {
        return [
            Training::count(), TrainingSection::count(), TrainingLesson::count(),
            TrainingResource::count(), TrainingQuiz::count(), TrainingQuizQuestion::count(),
        ];
    }
}
