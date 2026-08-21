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
use App\Services\TrainingJsonUpdateApplier;
use App\Services\TrainingJsonUpdatePlanner;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TrainingJsonUpdateApplierTest extends TestCase
{
    use RefreshDatabase;

    public function test_end_to_end_update_is_non_destructive_and_idempotent(): void
    {
        $training = $this->trainingWithContent();
        $package = app(TrainingJsonExporter::class)->package($training);
        TrainingSection::create([
            'training_id' => $training->id, 'title' => 'Section locale préservée',
            'sort_order' => 9, 'is_published' => true,
        ]);
        $package['data']['price'] = '250.00';
        $package['data']['id'] = 999999;
        $package['data']['payments'] = [['token' => 'secret']];
        $section = &$package['data']['sections'][0];
        $section['id'] = 999999;
        $section['description'] = 'Section modifiée';
        $lesson = &$section['lessons'][0];
        $lesson['content'] = 'Leçon modifiée';
        array_pop($lesson['resources']);
        $lesson['resources'][0]['description'] = 'Ressource modifiée';
        $lesson['resources'][] = $this->resourceData('Nouvelle ressource', 3);
        $section['quiz']['passing_score'] = 85;
        $section['quiz']['questions'][0]['options'] = ['Oui', 'Non', 'Peut-être'];
        $section['quiz']['questions'][0]['correct_option_index'] = 2;
        $section['quiz']['questions'][] = $this->questionData('Nouvelle question ?', 3);
        $section['lessons'][] = $this->lessonData('Nouvelle leçon', 'nouvelle-lecon', 2);
        $package['data']['sections'][] = $this->sectionData('Nouvelle section', 2, true);

        $first = app(TrainingJsonUpdateApplier::class)->apply(json_encode($package), 'update.json');

        $this->assertSame('250.00', $training->fresh()->price);
        $this->assertDatabaseHas('training_sections', ['title' => 'Nouvelle section']);
        $this->assertDatabaseHas('training_lessons', ['slug' => 'nouvelle-lecon', 'content' => null]);
        $this->assertDatabaseHas('training_resources', ['title' => 'Nouvelle ressource']);
        $this->assertDatabaseHas('training_quizzes', ['title' => 'Nouveau quiz']);
        $this->assertDatabaseHas('training_quiz_questions', ['question' => 'Nouvelle question ?', 'correct_option_index' => 0]);
        $this->assertDatabaseHas('training_resources', ['title' => 'Ressource locale']);
        $this->assertDatabaseHas('training_sections', ['title' => 'Section locale préservée']);
        $this->assertSame(0, $first['deleted']);

        $plan = app(TrainingJsonUpdatePlanner::class)->plan($package);
        $this->assertSame(0, $plan['summary']['creates']);
        $this->assertSame(0, $plan['summary']['updates']);
        $this->assertSame(0, $plan['summary']['ambiguous']);
        $this->assertGreaterThan(0, $plan['summary']['preserved']);
        $counts = $this->counts();

        $second = app(TrainingJsonUpdateApplier::class)->apply(json_encode($package), 'update.json');

        $this->assertSame($counts, $this->counts());
        $this->assertSame(0, array_sum($second['created']));
        $this->assertSame(0, array_sum($second['modified']));
        $this->assertSame(0, $second['deleted']);
    }

    public function test_ambiguous_plan_blocks_every_write(): void
    {
        $training = $this->trainingWithContent();
        TrainingSection::create([
            'training_id' => $training->id, 'title' => 'Section', 'sort_order' => 1,
            'is_published' => true,
        ]);
        $package = app(TrainingJsonExporter::class)->package($training->fresh());
        $package['schema_version'] = '1.0';
        unset($package['data']['sections'][0]['stable_id']);
        $package['data']['title'] = 'Ne doit pas changer';
        $package['data']['sections'] = [$package['data']['sections'][0]];
        $before = $this->snapshot();

        try {
            app(TrainingJsonUpdateApplier::class)->apply(json_encode($package));
            $this->fail('Une ambiguïté aurait dû bloquer la mise à jour.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('ambigu', $exception->getMessage());
        }

        $this->assertSame($before, $this->snapshot());
    }

    public function test_late_slug_collision_rolls_back_training_and_created_section(): void
    {
        $training = $this->trainingWithContent();
        $package = app(TrainingJsonExporter::class)->package($training);
        $package['data']['title'] = 'Titre transitoire';
        $package['data']['sections'][] = $this->sectionData('Section collision', 4);
        $package['data']['sections'][1]['lessons'][] = $this->lessonData('Collision', 'lecon', 1);
        $before = $this->snapshot();

        try {
            app(TrainingJsonUpdateApplier::class)->apply(json_encode($package));
            $this->fail('La collision aurait dû provoquer un rollback.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('collision', $exception->getMessage());
        }

        $this->assertSame($before, $this->snapshot());
    }

    public function test_http_endpoint_revalidates_file_and_enforces_admin_access(): void
    {
        $training = $this->trainingWithContent();
        $admin = User::where('role', 'admin')->firstOrFail();
        $client = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $package = app(TrainingJsonExporter::class)->package($training);
        $package['data']['title'] = 'Titre HTTP';
        $json = json_encode($package);

        $this->actingAs($client)->post(route('trainings.import-export.update'), [
            'file' => UploadedFile::fake()->createWithContent('update.json', $json),
        ])->assertForbidden();

        $response = $this->actingAs($admin)->post(route('trainings.import-export.update'), [
            'file' => UploadedFile::fake()->createWithContent('update.json', $json),
            'plan' => ['can_apply' => false, 'summary' => ['ambiguous' => 99]],
        ]);

        $response->assertRedirect(route('trainings.import-export'));
        $this->assertSame('Titre HTTP', $training->fresh()->title);
        $this->followRedirects($response)->assertInertia(fn ($page) => $page
            ->url('/dashboard/trainings/import-export')
            ->where('updateResult.deleted', 0)
            ->where('updateResult.training.slug', 'formation-source'));

        $this->actingAs($admin)->post(route('trainings.import-export.update'), [
            'file' => UploadedFile::fake()->createWithContent('invalid.json', '{invalid'),
        ])->assertSessionHasErrors('file');
    }

    private function trainingWithContent(): Training
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
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
            'file_disk' => 'public', 'is_downloadable' => true, 'is_public' => false, 'sort_order' => 1,
        ]);
        TrainingResource::create([
            'training_lesson_id' => $lesson->id, 'title' => 'Ressource locale',
            'file_disk' => 'public', 'is_downloadable' => true, 'is_public' => false, 'sort_order' => 2,
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

    private function sectionData(string $title, int $order, bool $withQuiz = false): array
    {
        return [
            'title' => $title, 'description' => null, 'sort_order' => $order,
            'is_published' => true, 'lessons' => [],
            'quiz' => $withQuiz ? [
                'title' => 'Nouveau quiz', 'description' => null, 'passing_score' => 70,
                'is_published' => false, 'questions' => [$this->questionData('Question créée ?', 1)],
            ] : null,
        ];
    }

    private function lessonData(string $title, string $slug, int $order): array
    {
        return [
            'title' => $title, 'slug' => $slug, 'excerpt' => null, 'content' => null,
            'video_url' => null, 'video_duration' => null, 'thumbnail' => null,
            'sort_order' => $order, 'is_free' => false, 'is_published' => true, 'resources' => [],
        ];
    }

    private function resourceData(string $title, int $order): array
    {
        return [
            'title' => $title, 'description' => null, 'file_path' => null, 'external_url' => null,
            'file_disk' => 'public', 'file_type' => null, 'is_downloadable' => true,
            'is_public' => false, 'sort_order' => $order,
        ];
    }

    private function questionData(string $question, int $order): array
    {
        return [
            'question' => $question, 'options' => ['A', 'B'], 'correct_option_index' => 0,
            'sort_order' => $order, 'points' => 1,
        ];
    }

    private function counts(): array
    {
        return [
            Training::count(), TrainingSection::count(), TrainingLesson::count(),
            TrainingResource::count(), TrainingQuiz::count(), TrainingQuizQuestion::count(),
        ];
    }

    private function snapshot(): array
    {
        return collect([
            'trainings', 'training_sections', 'training_lessons', 'training_resources',
            'training_quizzes', 'training_quiz_questions',
        ])->mapWithKeys(fn (string $table) => [
            $table => DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all(),
        ])->all();
    }
}
