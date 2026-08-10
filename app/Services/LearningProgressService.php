<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingProgress;
use App\Models\TrainingSection;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizAttempt;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class LearningProgressService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function getPublishedLessons(Training $training): Collection
    {
        return TrainingLesson::query()
            ->select('training_lessons.*')
            ->join('training_sections', 'training_sections.id', '=', 'training_lessons.training_section_id')
            ->where('training_lessons.training_id', $training->id)
            ->where('training_lessons.is_published', true)
            ->where('training_sections.is_published', true)
            ->orderBy('training_sections.sort_order')
            ->orderBy('training_sections.id')
            ->orderBy('training_lessons.sort_order')
            ->orderBy('training_lessons.id')
            ->get();
    }

    public function getProgress(Training $training, User $user): array
    {
        $lessons = $this->getPublishedLessons($training);
        $completedLessonIds = TrainingProgress::query()
            ->where('user_id', $user->id)
            ->where('training_id', $training->id)
            ->where('completed', true)
            ->whereIn('training_lesson_id', $lessons->pluck('id'))
            ->pluck('training_lesson_id')
            ->map(fn ($id) => (int) $id);

        return $this->summarizeProgress($lessons, $completedLessonIds);
    }

    public function getProgressForTrainings(Collection $trainings, User $user): Collection
    {
        if ($trainings->isEmpty()) {
            return collect();
        }

        $trainingIds = $trainings->pluck('id');
        $lessonsByTraining = TrainingLesson::query()
            ->select('training_lessons.*')
            ->join('training_sections', 'training_sections.id', '=', 'training_lessons.training_section_id')
            ->whereIn('training_lessons.training_id', $trainingIds)
            ->where('training_lessons.is_published', true)
            ->where('training_sections.is_published', true)
            ->orderBy('training_sections.sort_order')
            ->orderBy('training_sections.id')
            ->orderBy('training_lessons.sort_order')
            ->orderBy('training_lessons.id')
            ->get()
            ->groupBy('training_id');

        $completedByTraining = TrainingProgress::query()
            ->where('user_id', $user->id)
            ->whereIn('training_id', $trainingIds)
            ->where('completed', true)
            ->get(['training_id', 'training_lesson_id'])
            ->groupBy('training_id')
            ->map(fn (Collection $items) => $items
                ->pluck('training_lesson_id')
                ->map(fn ($id) => (int) $id));

        return $trainings->mapWithKeys(function (Training $training) use (
            $lessonsByTraining,
            $completedByTraining
        ) {
            $lessons = $lessonsByTraining->get($training->id, collect());
            $publishedLessonIds = $lessons->pluck('id')->map(fn ($id) => (int) $id);
            $completedLessonIds = $completedByTraining
                ->get($training->id, collect())
                ->intersect($publishedLessonIds);

            return [$training->id => $this->summarizeProgress($lessons, $completedLessonIds)];
        });
    }

    private function summarizeProgress(Collection $lessons, Collection $completedLessonIds): array
    {
        $totalLessons = $lessons->count();
        $completedLessons = $completedLessonIds->count();
        $percentage = $totalLessons > 0
            ? (int) round(($completedLessons / $totalLessons) * 100)
            : 0;

        return [
            'total_lessons' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'percentage' => $percentage,
            'has_started' => $completedLessons > 0,
            'is_completed' => $totalLessons > 0 && $completedLessons === $totalLessons,
            'first_lesson' => $lessons->first(),
            'next_lesson' => $lessons->first(
                fn (TrainingLesson $lesson) => !$completedLessonIds->contains((int) $lesson->id)
            ),
        ];
    }

    public function getSectionProgressSummaries(
        Training $training,
        Collection $sections,
        Collection $progress,
        User $user
    ): Collection {
        $publishedQuizIds = $sections
            ->pluck('quiz')
            ->filter(fn (?TrainingQuiz $quiz) => $quiz?->is_published)
            ->pluck('id');

        $passedQuizIds = TrainingQuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('training_id', $training->id)
            ->whereIn('training_quiz_id', $publishedQuizIds)
            ->where('passed', true)
            ->pluck('training_quiz_id');

        $previousSectionCompleted = true;

        return $sections->mapWithKeys(function (TrainingSection $section) use (
            $progress,
            $passedQuizIds,
            &$previousSectionCompleted
        ) {
            $totalLessons = $section->lessons->count();
            $completedLessons = $section->lessons->filter(
                fn (TrainingLesson $lesson) => (bool) optional($progress->get($lesson->id))->completed
            )->count();
            $lessonsCompleted = $totalLessons > 0 && $completedLessons === $totalLessons;
            $quiz = $section->quiz?->is_published ? $section->quiz : null;
            $canTakeQuiz = $quiz !== null && $lessonsCompleted;
            $isCompleted = $totalLessons === 0
                || ($lessonsCompleted && ($quiz === null || $passedQuizIds->contains($quiz->id)));
            $canAccess = $previousSectionCompleted;
            $previousSectionCompleted = $isCompleted;

            return [(string) $section->id => [
                'completed_lessons' => $completedLessons,
                'total_lessons' => $totalLessons,
                'progress_percentage' => $totalLessons > 0
                    ? (int) round(($completedLessons / $totalLessons) * 100)
                    : 0,
                'is_completed' => $isCompleted,
                'can_access' => $canAccess,
                'can_take_quiz' => $canTakeQuiz,
            ]];
        });
    }

    public function progressPercentage(Training $training, User $user): int
    {
        return $this->getProgress($training, $user)['percentage'];
    }

    public function hasStarted(Training $training, User $user): bool
    {
        return $this->getProgress($training, $user)['has_started'];
    }

    public function isCompleted(Training $training, User $user): bool
    {
        return $this->getProgress($training, $user)['is_completed'];
    }

    public function getNextLesson(Training $training, User $user): ?TrainingLesson
    {
        return $this->getProgress($training, $user)['next_lesson'];
    }

    public function getFollowingLesson(Training $training, TrainingLesson $lesson): ?TrainingLesson
    {
        $lessons = $this->getPublishedLessons($training)->values();
        $position = $lessons->search(fn (TrainingLesson $candidate) => $candidate->is($lesson));

        return $position === false ? null : $lessons->get($position + 1);
    }

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

    public function ensureLessonAccess(Training $training, TrainingLesson $lesson, User $user): void
    {
        $this->ensureTrainingAccess($training, $user);
        abort_unless((int) $lesson->training_id === (int) $training->id, 404);

        $lesson->loadMissing('section');
        abort_unless($lesson->section, 404);

        if (!$user->isAdmin()) {
            abort_unless($lesson->is_published && $lesson->section->is_published, 404);
        }

        $this->ensureCanAccessSection($training, $lesson->section, $user->id);
    }

    public function ensureSectionAccess(Training $training, TrainingSection $section, User $user): void
    {
        $this->ensureTrainingAccess($training, $user);
        abort_unless((int) $section->training_id === (int) $training->id, 404);

        if (!$user->isAdmin()) {
            abort_unless($section->is_published, 404);
        }

        $this->ensureCanAccessSection($training, $section, $user->id);
    }

    public function markLessonCompleted(Training $training, TrainingLesson $lesson, User $user): TrainingProgress
    {
        $this->ensureLessonAccess($training, $lesson, $user);

        $progress = TrainingProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'training_id' => $training->id,
                'training_lesson_id' => $lesson->id,
            ],
            ['completed' => true, 'completed_at' => now()]
        );

        $this->clearSectionProgressCache($user->id, $training->id, $lesson->training_section_id);

        return $progress;
    }

    public function markLessonIncomplete(Training $training, TrainingLesson $lesson, User $user): void
    {
        $this->ensureLessonAccess($training, $lesson, $user);

        TrainingProgress::query()
            ->where('user_id', $user->id)
            ->where('training_id', $training->id)
            ->where('training_lesson_id', $lesson->id)
            ->update(['completed' => false, 'completed_at' => null]);

        $this->clearSectionProgressCache($user->id, $training->id, $lesson->training_section_id);
    }

    public function clearSectionProgressCache(int $userId, int $trainingId, int $sectionId): void
    {
        cache()->forget("can_take_quiz:{$userId}:{$trainingId}:{$sectionId}");
        cache()->forget("section_lessons:{$trainingId}:{$sectionId}");
    }

    public function isSectionCompleted(Training $training, TrainingSection $section, int $userId): bool
    {
        $lessonIds = $this->getSectionLessonIds($training, $section);

        if ($lessonIds->isEmpty()) {
            return true;
        }

        if ($this->countCompletedSectionLessons($training, $section, $userId) !== $lessonIds->count()) {
            return false;
        }

        $quiz = TrainingQuiz::where('training_id', $training->id)
            ->where('training_section_id', $section->id)
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
            ->where('is_published', true)
            ->where(function ($query) use ($section) {
                $query->where('sort_order', '<', $section->sort_order)
                    ->orWhere(function ($query) use ($section) {
                        $query->where('sort_order', $section->sort_order)
                            ->where('id', '<', $section->id);
                    });
            })
            ->orderByDesc('sort_order')
            ->orderByDesc('id')
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
