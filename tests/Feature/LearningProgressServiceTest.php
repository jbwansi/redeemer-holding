<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingParticipant;
use App\Models\TrainingProgress;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizAttempt;
use App\Models\TrainingSection;
use App\Models\User;
use App\Services\LearningProgressService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Env;
use Tests\TestCase;

class LearningProgressServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([OnlyTestUsers::class]);
    }

    public function test_progress_uses_published_lessons_and_logical_section_order(): void
    {
        $user = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining();
        $lateSection = $this->createSection($training, 20, 'Module tardif');
        $earlySection = $this->createSection($training, 10, 'Module initial');
        $lateLesson = $this->createLesson($training, $lateSection, 1, true, 'tardive');
        $earlyLesson = $this->createLesson($training, $earlySection, 1, true, 'initiale');
        $this->createLesson($training, $earlySection, 2, false, 'brouillon');

        $service = app(LearningProgressService::class);
        $emptyProgress = $service->getProgress($training, $user);

        $this->assertSame(2, $emptyProgress['total_lessons']);
        $this->assertSame(0, $emptyProgress['percentage']);
        $this->assertFalse($emptyProgress['has_started']);
        $this->assertFalse($emptyProgress['is_completed']);
        $this->assertTrue($earlyLesson->is($emptyProgress['next_lesson']));

        $this->createProgress($user, $training, $earlyLesson);
        $partialProgress = $service->getProgress($training, $user);

        $this->assertSame(50, $partialProgress['percentage']);
        $this->assertTrue($partialProgress['has_started']);
        $this->assertFalse($partialProgress['is_completed']);
        $this->assertTrue($lateLesson->is($partialProgress['next_lesson']));

        $this->createProgress($user, $training, $lateLesson);

        $this->assertTrue($service->isCompleted($training, $user));
        $this->assertSame(100, $service->progressPercentage($training, $user));
        $this->assertNull($service->getNextLesson($training, $user));
    }

    public function test_training_without_published_lessons_is_not_completed(): void
    {
        $user = User::factory()->create();
        $training = $this->createTraining();

        $this->assertFalse(app(LearningProgressService::class)->isCompleted($training, $user));
    }

    public function test_empty_section_does_not_block_the_next_published_section(): void
    {
        $user = User::factory()->create();
        $training = $this->createTraining();
        $emptySection = $this->createSection($training, 1, 'Module vide');
        $nextSection = $this->createSection($training, 2, 'Module suivant');
        $service = app(LearningProgressService::class);

        $this->assertTrue($service->isSectionCompleted($training, $emptySection, $user->id));
        $this->assertTrue($service->canAccessSection($training, $nextSection, $user->id));
    }

    public function test_batched_training_progress_uses_a_constant_number_of_queries(): void
    {
        $user = User::factory()->create();
        $trainings = collect();

        foreach (range(1, 3) as $order) {
            $training = $this->createTraining();
            $section = $this->createSection($training, 1, "Module {$order}");
            $this->createLesson($training, $section, 1, true, "lesson-{$order}");
            $trainings->push($training);
        }

        DB::flushQueryLog();
        DB::enableQueryLog();
        $summaries = app(LearningProgressService::class)
            ->getProgressForTrainings($trainings, $user);
        $queryCount = count(DB::getQueryLog());
        DB::disableQueryLog();

        $this->assertCount(3, $summaries);
        $this->assertSame(2, $queryCount);
    }

    public function test_section_without_quiz_unlocks_next_section_after_its_lessons_are_completed(): void
    {
        $user = User::factory()->create();
        $training = $this->createTraining();
        $firstSection = $this->createSection($training, 1, 'Module 1');
        $secondSection = $this->createSection($training, 2, 'Module 2');
        $lesson = $this->createLesson($training, $firstSection, 1, true, 'module-1');
        $service = app(LearningProgressService::class);

        $this->assertFalse($service->canAccessSection($training, $secondSection, $user->id));

        $this->createProgress($user, $training, $lesson);
        $service->clearSectionProgressCache($user->id, $training->id, $firstSection->id);

        $this->assertTrue($service->isSectionCompleted($training, $firstSection, $user->id));
        $this->assertTrue($service->canAccessSection($training, $secondSection, $user->id));
        $this->assertFalse($service->canTakeQuiz($training, $firstSection, $user->id));
    }

    public function test_published_quiz_must_be_passed_to_complete_a_section_and_retakes_remain_allowed(): void
    {
        $user = User::factory()->create();
        $training = $this->createTraining();
        $section = $this->createSection($training, 1, 'Module quiz');
        $lesson = $this->createLesson($training, $section, 1, true, 'quiz-lesson');
        $quiz = TrainingQuiz::create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'Validation',
            'passing_score' => 70,
            'is_published' => true,
        ]);
        $this->createProgress($user, $training, $lesson);
        $service = app(LearningProgressService::class);

        $this->assertTrue($service->canTakeQuiz($training, $section, $user->id));
        $this->assertFalse($service->isSectionCompleted($training, $section, $user->id));

        foreach ([false, true] as $passed) {
            TrainingQuizAttempt::create([
                'user_id' => $user->id,
                'training_id' => $training->id,
                'training_section_id' => $section->id,
                'training_quiz_id' => $quiz->id,
                'total_questions' => 1,
                'correct_answers' => $passed ? 1 : 0,
                'score' => $passed ? 100 : 0,
                'passed' => $passed,
                'answers' => [],
                'started_at' => now(),
                'submitted_at' => now(),
            ]);
        }

        $this->assertSame(2, TrainingQuizAttempt::where('user_id', $user->id)->count());
        $this->assertTrue($service->isSectionCompleted($training, $section, $user->id));
        $this->assertTrue($service->canTakeQuiz($training, $section, $user->id));
    }

    public function test_progress_endpoints_are_authorized_idempotent_and_user_scoped(): void
    {
        $owner = User::factory()->create(['is_active' => 1]);
        $otherUser = User::factory()->create(['is_active' => 1]);
        $outsider = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining();
        $section = $this->createSection($training, 1, 'Module');
        $lesson = $this->createLesson($training, $section, 1, true, 'securisee');
        $this->grantAccess($owner, $training);
        $this->grantAccess($otherUser, $training);
        $this->createProgress($otherUser, $training, $lesson);

        $url = route('learning.lessons.complete', [$training, $lesson]);
        $this->actingAs($outsider)->post($url)->assertForbidden();
        $this->actingAs($owner)->post($url)->assertRedirect();
        $this->actingAs($owner)->post($url)->assertRedirect();

        $this->assertSame(1, TrainingProgress::where('user_id', $owner->id)->count());
        $this->assertDatabaseHas('training_progress', [
            'user_id' => $otherUser->id,
            'training_lesson_id' => $lesson->id,
            'completed' => true,
        ]);

        $this->actingAs($owner)
            ->post(route('learning.lessons.uncomplete', [$training, $lesson]))
            ->assertRedirect();

        $this->assertDatabaseHas('training_progress', [
            'user_id' => $owner->id,
            'training_lesson_id' => $lesson->id,
            'completed' => false,
        ]);
        $this->assertDatabaseHas('training_progress', [
            'user_id' => $otherUser->id,
            'training_lesson_id' => $lesson->id,
            'completed' => true,
        ]);
    }

    public function test_unpublished_lesson_cannot_be_completed_by_a_learner(): void
    {
        $user = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining();
        $section = $this->createSection($training, 1, 'Module');
        $lesson = $this->createLesson($training, $section, 1, false, 'non-publiee');
        $this->grantAccess($user, $training);

        $this->actingAs($user)
            ->post(route('learning.lessons.complete', [$training, $lesson]))
            ->assertNotFound();

        $this->assertDatabaseMissing('training_progress', [
            'user_id' => $user->id,
            'training_lesson_id' => $lesson->id,
        ]);
    }

    public function test_certificates_are_disabled_and_expose_no_route(): void
    {
        $this->assertFalse(config('features.certificates_enabled'));

        $certificateRoutes = collect(Route::getRoutes())->filter(
            fn ($route) => str_contains(strtolower((string) $route->getName()), 'certificate')
                || str_contains(strtolower($route->uri()), 'certificate')
        );

        $this->assertCount(0, $certificateRoutes);
    }

    public function test_certificate_flag_defaults_to_false_without_environment_override(): void
    {
        $repository = Env::getRepository();
        $previousValue = $repository->get('CERTIFICATES_ENABLED');
        $repository->clear('CERTIFICATES_ENABLED');

        try {
            $features = require config_path('features.php');
            $this->assertFalse($features['certificates_enabled']);
        } finally {
            if ($previousValue !== null) {
                $repository->set('CERTIFICATES_ENABLED', $previousValue);
            }
        }
    }

    private function createTraining(): Training
    {
        return Training::create([
            'title' => 'Formation LMS',
            'slug' => 'formation-lms-' . uniqid(),
            'content' => 'Contenu de formation',
            'location' => 'En ligne',
            'start_date' => now()->subDay(),
            'end_date' => now()->addWeek(),
            'price' => 0,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
    }

    private function createSection(Training $training, int $order, string $title): TrainingSection
    {
        return TrainingSection::create([
            'training_id' => $training->id,
            'title' => $title,
            'sort_order' => $order,
            'is_published' => true,
        ]);
    }

    private function createLesson(
        Training $training,
        TrainingSection $section,
        int $order,
        bool $published,
        string $slug
    ): TrainingLesson {
        return TrainingLesson::create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => ucfirst($slug),
            'slug' => $slug . '-' . uniqid(),
            'sort_order' => $order,
            'is_published' => $published,
        ]);
    }

    private function createProgress(User $user, Training $training, TrainingLesson $lesson): void
    {
        TrainingProgress::create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'training_lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    private function grantAccess(User $user, Training $training): void
    {
        TrainingParticipant::create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'name' => $user->name,
            'qty' => 1,
            'email' => $user->email,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_confirmed' => true,
            'payment_date' => now(),
        ]);
    }
}
