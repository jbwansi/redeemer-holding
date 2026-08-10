<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingParticipant;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizQuestion;
use App\Models\TrainingSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LmsProductReliabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([OnlyTestUsers::class]);
    }

    public function test_authorized_user_can_complete_the_full_learning_workflow(): void
    {
        $user = User::factory()->create(['is_active' => 1]);
        $otherUser = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining();
        $firstSection = $this->createSection($training, 1, 'Fondations');
        $secondSection = $this->createSection($training, 2, 'Approfondissement');
        $firstLesson = $this->createLesson($training, $firstSection, 1, true, 'fondations');
        $secondLesson = $this->createLesson($training, $secondSection, 1, true, 'approfondissement');
        $quiz = TrainingQuiz::create([
            'training_id' => $training->id,
            'training_section_id' => $firstSection->id,
            'title' => 'Quiz fondations',
            'passing_score' => 70,
            'is_published' => true,
        ]);
        $question = TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id,
            'question' => 'Réponse correcte ?',
            'options' => ['Oui', 'Non'],
            'correct_option_index' => 0,
            'sort_order' => 1,
        ]);
        $this->grantAccess($user, $training);

        $this->actingAs($user)
            ->get(route('learning.show', $training))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where("section_progress.{$secondSection->id}.can_access", false));

        $this->actingAs($user)
            ->get(route('learning.lesson', [$training, $secondLesson]))
            ->assertForbidden();
        $this->actingAs($user)
            ->post(route('learning.lessons.complete', [$training, $secondLesson]))
            ->assertForbidden();
        $this->actingAs($user)
            ->get(route('learning.quiz.show', [$training, $secondSection]))
            ->assertForbidden();

        $this->actingAs($user)
            ->post(route('learning.lessons.complete', [$training, $firstLesson]), [
                'user_id' => $otherUser->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('training_progress', [
            'user_id' => $user->id,
            'training_lesson_id' => $firstLesson->id,
            'completed' => true,
        ]);
        $this->assertDatabaseMissing('training_progress', [
            'user_id' => $otherUser->id,
            'training_lesson_id' => $firstLesson->id,
        ]);

        $this->actingAs($user)
            ->get(route('learning.quiz.show', [$training, $firstSection]))
            ->assertOk();
        $this->actingAs($user)
            ->post(route('learning.quiz.submit', [$training, $firstSection]), [
                'answers' => [(string) $question->id => 0],
            ])
            ->assertRedirect(route('learning.quiz.show', [$training, $firstSection]));

        $this->actingAs($user)
            ->get(route('learning.lesson', [$training, $secondLesson]))
            ->assertOk();
        $this->actingAs($user)
            ->post(route('learning.lessons.complete', [$training, $secondLesson]))
            ->assertRedirect();

        $this->actingAs($user)
            ->get(route('learning.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainings.0.action_label', 'Revoir')
                ->where('trainings.0.progress', 100));
    }

    public function test_training_without_section_is_stable_and_remains_at_start(): void
    {
        $user = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining();
        $this->grantAccess($user, $training);

        $this->actingAs($user)
            ->get(route('learning.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainings.0.action_label', 'Commencer')
                ->where('trainings.0.progress', 0)
                ->where('trainings.0.is_completed', false)
                ->where('trainings.0.action_url', route('learning.show', $training)));

        $this->actingAs($user)
            ->get(route('learning.show', $training))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('training.sections', 0));
    }

    public function test_unpublished_section_and_lessons_are_invisible_and_do_not_block_learning(): void
    {
        $user = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining();
        $hiddenSection = $this->createSection($training, 1, 'Cachée', false);
        $visibleSection = $this->createSection($training, 2, 'Visible');
        $hiddenLesson = $this->createLesson($training, $hiddenSection, 1, true, 'section-cachee');
        $draftLesson = $this->createLesson($training, $visibleSection, 1, false, 'brouillon');
        $visibleLesson = $this->createLesson($training, $visibleSection, 2, true, 'visible');
        $this->grantAccess($user, $training);

        $this->actingAs($user)
            ->get(route('learning.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainings.0.lessons_count', 1)
                ->where('trainings.0.action_url', route('learning.lesson', [$training, $visibleLesson])));

        $this->actingAs($user)
            ->get(route('learning.show', $training))
            ->assertInertia(fn (Assert $page) => $page
                ->has('training.sections', 1)
                ->where('training.sections.0.id', $visibleSection->id)
                ->has('training.sections.0.lessons', 1));

        $this->actingAs($user)->get(route('learning.lesson', [$training, $hiddenLesson]))->assertNotFound();
        $this->actingAs($user)->get(route('learning.lesson', [$training, $draftLesson]))->assertNotFound();
        $this->actingAs($user)->post(route('learning.lessons.complete', [$training, $draftLesson]))->assertNotFound();
        $this->actingAs($user)->get(route('learning.lesson', [$training, $visibleLesson]))->assertOk();
    }

    public function test_old_participation_does_not_expose_an_unpublished_training(): void
    {
        $user = User::factory()->create(['is_active' => 1]);
        $training = $this->createTraining(false);
        $this->grantAccess($user, $training);

        $this->actingAs($user)
            ->get(route('learning.index'))
            ->assertInertia(fn (Assert $page) => $page->has('trainings', 0));
        $this->actingAs($user)
            ->get(route('learning.show', $training))
            ->assertForbidden();
    }

    private function createTraining(bool $published = true): Training
    {
        return Training::create([
            'title' => 'Formation produit',
            'slug' => 'formation-produit-' . uniqid(),
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->subDay(),
            'end_date' => now()->addWeek(),
            'price' => 0,
            'is_published' => $published,
            'published_at' => $published ? now()->subDay() : null,
        ]);
    }

    private function createSection(
        Training $training,
        int $order,
        string $title,
        bool $published = true
    ): TrainingSection {
        return TrainingSection::create([
            'training_id' => $training->id,
            'title' => $title,
            'sort_order' => $order,
            'is_published' => $published,
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
