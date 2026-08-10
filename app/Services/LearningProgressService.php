<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingProgress;
use App\Models\TrainingSection;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class LearningProgressService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function getSectionLessonIds(Training $training, TrainingSection $section)
    {
        $cacheKey = "section_lessons:{$training->id}:{$section->id}";

        return cache()->remember($cacheKey, self::CACHE_TTL, function () use ($training, $section) {
            return TrainingLesson::where('training_id', $training->id)
                ->where('training_section_id', $section->id)
                ->where('is_published', true)
                ->pluck('id');
        });
    }

    public function countCompletedSectionLessons(Training $training, TrainingSection $section, int $userId): int
    {
        $lessonIds = $this->getSectionLessonIds($training, $section);

        return TrainingProgress::where('user_id', $userId)
            ->where('training_id', $training->id)
            ->whereIn('training_lesson_id', $lessonIds)
            ->where('completed', true)
            ->count();
    }

    public function canTakeQuiz(Training $training, TrainingSection $section, int $userId): bool
    {
        $cacheKey = "can_take_quiz:{$userId}:{$training->id}:{$section->id}";

        $quizExists = TrainingQuiz::where('training_id', $training->id)
            ->where('training_section_id', $section->id)
            ->where('is_published', true)
            ->exists();

        if (!$quizExists) {
            return false;
        }

        return cache()->remember($cacheKey, self::CACHE_TTL, function () use ($training, $section, $userId) {
            $lessonIds = $this->getSectionLessonIds($training, $section);

            if ($lessonIds->isEmpty()) {
                return false;
            }

            $completedLessons = $this->countCompletedSectionLessons($training, $section, $userId);
            return $completedLessons === $lessonIds->count();
        });
    }

    public function ensureCanTakeQuiz(Training $training, TrainingSection $section, int $userId): void
    {
        abort_unless(
            $this->canTakeQuiz($training, $section, $userId),
            403,
            'Vous devez terminer toutes les leçons de ce module avant de passer le quiz.'
        );
    }

    public function ensureTrainingAccess(Training $training, ?User $user): void
    {
        abort_unless($user, 403, 'Vous devez être connecté pour accéder à cette formation.');

        Gate::forUser($user)->authorize('viewLearning', $training);
    }


    public function clearSectionProgressCache(int $userId, int $trainingId, int $sectionId): void
    {
        cache()->forget("can_take_quiz:{$userId}:{$trainingId}:{$sectionId}");
        cache()->forget("section_lessons:{$trainingId}:{$sectionId}");
    }

    public function isSectionCompleted(Training $training, TrainingSection $section, int $userId): bool
    {
        if (!$this->canTakeQuiz($training, $section, $userId)) {
            return false;
        }

        $quiz = TrainingQuiz::where('training_section_id', $section->id)
            ->where('is_published', true)
            ->first();

        if (!$quiz) {
            return true;
        }

        return TrainingQuizAttempt::where('user_id', $userId)
            ->where('training_quiz_id', $quiz->id)
            ->where('passed', true)
            ->exists();
    }

    public function canAccessSection(Training $training, TrainingSection $section, int $userId): bool
    {
        $previousSection = TrainingSection::where('training_id', $training->id)
            ->where('sort_order', '<', $section->sort_order)
            ->orderByDesc('sort_order')
            ->first();

        if (!$previousSection) {
            return true;
        }

        return $this->isSectionCompleted($training, $previousSection, $userId);
    }

    public function ensureCanAccessSection(Training $training, TrainingSection $section, int $userId): void
    {
        abort_unless(
            $this->canAccessSection($training, $section, $userId),
            403,
            'Vous devez terminer le module précédent avant d’accéder à celui-ci.'
        );
    }
}
