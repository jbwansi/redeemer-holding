<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingParticipant;
use App\Models\TrainingProgress;
use App\Models\TrainingSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LearningResumeActionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([OnlyTestUsers::class]);
    }

    public function test_learning_index_exposes_start_continue_and_review_actions(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'is_active' => 1,
        ]);

        $startTraining = $this->createTrainingWithLessons('Formation Start', 'formation-start', 0, 3);
        $continueTraining = $this->createTrainingWithLessons('Formation Continue', 'formation-continue', 120, 3);
        $reviewTraining = $this->createTrainingWithLessons('Formation Review', 'formation-review', 50, 2);

        $this->grantLearningAccess($user, $startTraining, false);
        $this->grantLearningAccess($user, $continueTraining, true);
        $this->grantLearningAccess($user, $reviewTraining, true);

        $continueLessons = $continueTraining->lessons()->orderBy('training_section_id')->orderBy('sort_order')->orderBy('id')->get();
        TrainingProgress::create([
            'user_id' => $user->id,
            'training_id' => $continueTraining->id,
            'training_lesson_id' => $continueLessons[0]->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $reviewLessons = $reviewTraining->lessons()->orderBy('training_section_id')->orderBy('sort_order')->orderBy('id')->get();
        foreach ($reviewLessons as $lesson) {
            TrainingProgress::create([
                'user_id' => $user->id,
                'training_id' => $reviewTraining->id,
                'training_lesson_id' => $lesson->id,
                'completed' => true,
                'completed_at' => now(),
            ]);
        }

        $response = $this->actingAs($user)->get(route('learning.index'));

        $response->assertOk();
        $response->assertInertia(fn(Assert $page) => $page
            ->component('Frontend/learning/index')
            ->has('trainings', 3)
            ->where('trainings.0.action_label', 'Commencer')
            ->where('trainings.0.action_url', route('learning.lesson', [
                'training' => $startTraining->id,
                'lesson' => $startTraining->lessons()->orderBy('training_section_id')->orderBy('sort_order')->orderBy('id')->first()->id,
            ]))
            ->where('trainings.1.action_label', 'Continuer')
            ->where('trainings.1.action_url', route('learning.lesson', [
                'training' => $continueTraining->id,
                'lesson' => $continueLessons[1]->id,
            ]))
            ->where('trainings.2.action_label', 'Revoir')
            ->where('trainings.2.action_url', route('learning.lesson', [
                'training' => $reviewTraining->id,
                'lesson' => $reviewLessons[0]->id,
            ]))
        );
    }

    private function createTrainingWithLessons(string $title, string $slug, float $price, int $lessonsCount): Training
    {
        $training = Training::create([
            'title' => $title,
            'slug' => $slug,
            'excerpt' => 'Excerpt',
            'content' => 'Content',
            'location' => 'Online',
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(7),
            'price' => $price,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);

        $section = TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'Section 1',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        for ($i = 1; $i <= $lessonsCount; $i++) {
            TrainingLesson::create([
                'training_id' => $training->id,
                'training_section_id' => $section->id,
                'title' => "Lecon {$i}",
                'slug' => "{$slug}-lecon-{$i}",
                'sort_order' => $i,
                'is_published' => true,
            ]);
        }

        return $training;
    }

    private function grantLearningAccess(User $user, Training $training, bool $paid): void
    {
        TrainingParticipant::create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'name' => $user->name,
            'qty' => 1,
            'email' => $user->email,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_confirmed' => $paid,
            'payment_date' => now(),
            'payment_id' => $paid ? 'paid-' . $training->id : null,
        ]);
    }
}
