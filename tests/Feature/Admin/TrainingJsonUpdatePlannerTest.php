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
use App\Services\TrainingJsonUpdatePlanner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TrainingJsonUpdatePlannerTest extends TestCase
{
    use RefreshDatabase;

    public function test_identical_export_produces_only_unchanged_actions_without_writes(): void
    {
        $training = $this->trainingWithContent();
        $before = $this->databaseSnapshot();

        $plan = app(TrainingJsonUpdatePlanner::class)->plan(
            app(TrainingJsonExporter::class)->package($training)
        );

        $this->assertTrue($plan['read_only']);
        $this->assertTrue($plan['can_apply']);
        $this->assertSame(0, $plan['summary']['creates']);
        $this->assertSame(0, $plan['summary']['updates']);
        $this->assertSame(0, $plan['summary']['preserved']);
        $this->assertSame(0, $plan['summary']['ambiguous']);
        $this->assertGreaterThan(0, $plan['summary']['unchanged']);
        $this->assertSame($before, $this->databaseSnapshot());
    }

    public function test_detailed_plan_covers_updates_creations_and_preservation_without_writes(): void
    {
        $training = $this->trainingWithContent();
        $preservedSection = TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'Locale uniquement',
            'sort_order' => 9,
            'is_published' => true,
        ]);
        TrainingLesson::create([
            'training_id' => $training->id,
            'training_section_id' => $preservedSection->id,
            'title' => 'Leçon locale',
            'slug' => 'lecon-locale',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        $package = app(TrainingJsonExporter::class)->package($training->fresh());
        array_pop($package['data']['sections']);
        $package['data']['title'] = 'Titre importé';
        $package['data']['participants'] = [['email' => 'secret@example.test']];
        $section = &$package['data']['sections'][0];
        $section['description'] = 'Description importée';
        $lesson = &$section['lessons'][0];
        array_pop($lesson['resources']);
        $lesson['content'] = 'Contenu importé';
        $lesson['resources'][0]['description'] = 'Ressource mise à jour';
        $lesson['resources'][] = [
            'title' => 'Nouvelle ressource', 'description' => null, 'file_path' => null,
            'external_url' => 'https://example.test/new', 'file_disk' => 'public',
            'file_type' => null, 'is_downloadable' => true, 'is_public' => false, 'sort_order' => 2,
        ];
        $section['quiz']['passing_score'] = 90;
        array_pop($section['quiz']['questions']);
        $section['quiz']['questions'][0]['options'] = ['Oui', 'Non'];
        $section['quiz']['questions'][0]['correct_option_index'] = 1;
        $section['quiz']['questions'][] = [
            'question' => 'Nouvelle question ?', 'options' => ['A', 'B'],
            'correct_option_index' => 0, 'sort_order' => 2, 'points' => 2,
        ];
        $section['lessons'][] = [
            'title' => 'Nouvelle leçon', 'slug' => 'nouvelle-lecon', 'excerpt' => null,
            'content' => null, 'video_url' => null, 'video_duration' => null,
            'thumbnail' => null, 'sort_order' => 2, 'is_free' => false,
            'is_published' => true, 'resources' => [],
        ];
        $package['data']['sections'][] = [
            'title' => 'Nouvelle section', 'description' => null, 'sort_order' => 2,
            'is_published' => true, 'lessons' => [], 'quiz' => [
                'title' => 'Nouveau quiz', 'description' => null, 'passing_score' => 70,
                'is_published' => false, 'questions' => [[
                    'question' => 'Question créée ?', 'options' => ['A', 'B'],
                    'correct_option_index' => 0, 'sort_order' => 1, 'points' => 1,
                ]],
            ],
        ];
        $before = $this->databaseSnapshot();

        $plan = app(TrainingJsonUpdatePlanner::class)->plan($package);
        $nodes = $this->flatten($plan);

        $this->assertSame('UPDATE', $plan['training']['action']);
        $this->assertContains('title', array_column($plan['training']['changes'], 'field'));
        $this->assertContains('UPDATE', array_column($nodes, 'action'));
        $this->assertContains('CREATE', array_column($nodes, 'action'));
        $this->assertContains('PRESERVE', array_column($nodes, 'action'));
        $this->assertSame('CREATE', collect($nodes)->firstWhere('label', 'Nouvelle section')['action']);
        $this->assertSame('CREATE', collect($nodes)->firstWhere('label', 'Nouvelle leçon')['action']);
        $this->assertSame('UPDATE', collect($nodes)->firstWhere('label', 'Document')['action']);
        $this->assertSame('UPDATE', collect($nodes)->firstWhere('label', 'Quiz')['action']);
        $this->assertSame('UPDATE', collect($nodes)->firstWhere('label', 'Question ?')['action']);
        $this->assertSame('PRESERVE', collect($nodes)->firstWhere('label', 'Document local')['action']);
        $this->assertSame('PRESERVE', collect($nodes)->firstWhere('label', 'Question locale ?')['action']);
        $this->assertSame('CREATE', collect($nodes)->firstWhere('label', 'Nouveau quiz')['action']);
        $this->assertSame('CREATE', collect($nodes)->firstWhere('label', 'Question créée ?')['action']);
        $this->assertSame('PRESERVE', collect($nodes)->firstWhere('label', 'Locale uniquement')['action']);
        $this->assertSame($before, $this->databaseSnapshot());
        $this->assertDatabaseMissing('users', ['email' => 'secret@example.test']);
    }

    public function test_ambiguous_section_match_blocks_future_application_and_does_not_choose_arbitrarily(): void
    {
        $training = $this->trainingWithContent();
        TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'Section',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        $package = app(TrainingJsonExporter::class)->package($training->fresh());
        $package['schema_version'] = '1.0';
        unset($package['data']['sections'][0]['stable_id']);
        $package['data']['sections'] = [$package['data']['sections'][0]];
        $before = $this->databaseSnapshot();

        $plan = app(TrainingJsonUpdatePlanner::class)->plan($package);

        $this->assertFalse($plan['can_apply']);
        $this->assertSame(1, $plan['summary']['ambiguous']);
        $this->assertSame('AMBIGUOUS', $plan['content']['sections'][0]['action']);
        $this->assertArrayHasKey('reason', $plan['content']['sections'][0]);
        $this->assertSame($before, $this->databaseSnapshot());
    }

    public function test_http_analysis_of_existing_training_exposes_read_only_plan_on_canonical_page(): void
    {
        $training = $this->trainingWithContent();
        $admin = User::where('role', 'admin')->firstOrFail();
        $package = app(TrainingJsonExporter::class)->package($training);
        $package['data']['title'] = 'Titre à simuler';

        $response = $this->actingAs($admin)->post(route('trainings.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('existing.json', json_encode($package)),
        ]);

        $response->assertRedirect(route('trainings.import-export'));
        $this->followRedirects($response)->assertInertia(fn ($page) => $page
            ->url('/dashboard/trainings/import-export')
            ->where('analysis.status', 'existing')
            ->where('analysis.update_plan.mode', 'update_plan')
            ->where('analysis.update_plan.read_only', true)
            ->where('analysis.update_plan.training.action', 'UPDATE'));
    }

    private function trainingWithContent(): Training
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = Training::create([
            'user_id' => $admin->id, 'title' => 'Formation source', 'slug' => 'formation-source',
            'content' => 'Contenu', 'location' => 'Genève', 'start_date' => now()->addMonth()->startOfMinute(),
            'end_date' => now()->addMonth()->addDay()->startOfMinute(), 'price' => 100,
            'is_published' => true,
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
        TrainingResource::create([
            'training_lesson_id' => $lesson->id, 'title' => 'Document local',
            'file_disk' => 'public', 'is_downloadable' => true, 'is_public' => false,
            'sort_order' => 2,
        ]);
        $quiz = TrainingQuiz::create([
            'training_id' => $training->id, 'training_section_id' => $section->id,
            'title' => 'Quiz', 'passing_score' => 70, 'is_published' => true,
        ]);
        TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id, 'question' => 'Question ?',
            'options' => ['A', 'B'], 'correct_option_index' => 0, 'sort_order' => 1, 'points' => 1,
        ]);
        TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id, 'question' => 'Question locale ?',
            'options' => ['A', 'B'], 'correct_option_index' => 0, 'sort_order' => 2, 'points' => 1,
        ]);

        return $training;
    }

    private function databaseSnapshot(): array
    {
        return collect([
            'trainings', 'training_sections', 'training_lessons', 'training_resources',
            'training_quizzes', 'training_quiz_questions',
        ])->mapWithKeys(fn (string $table) => [
            $table => DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all(),
        ])->all();
    }

    private function flatten(array $plan): array
    {
        $nodes = [];
        $visit = function (array $node) use (&$visit, &$nodes): void {
            $nodes[] = $node;
            foreach (['lessons', 'resources', 'questions'] as $relation) {
                foreach ($node[$relation] ?? [] as $child) {
                    $visit($child);
                }
            }
            if (! empty($node['quiz'])) {
                $visit($node['quiz']);
            }
        };
        foreach ($plan['content']['sections'] as $section) {
            $visit($section);
        }

        return $nodes;
    }
}
