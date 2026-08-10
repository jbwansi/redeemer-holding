<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingParticipant;
use App\Models\TrainingProgress;
use App\Services\LearningProgressService;

class LearningController extends Controller
{
    public function index()
    {
        $trainings = Training::whereHas('participants', function ($query) {
            $query->where('user_id', auth()->id())
                ->whereIn('status', [
                    TrainingParticipant::STATUS_REGISTERED,
                    TrainingParticipant::STATUS_CONFIRMED,
                    TrainingParticipant::STATUS_IN_PROGRESS,
                    TrainingParticipant::STATUS_COMPLETED,
                ])
                ->where(function ($participantQuery) {
                    $participantQuery->where('payment_confirmed', true)
                        ->orWhereHas('training', function ($trainingQuery) {
                            $trainingQuery->where('price', '<=', 0);
                        });
                });
        })
            ->when(!auth()->user()->isAdmin(), fn ($query) => $query->where('is_published', true))
            ->orderBy('id')
            ->get();

        $progressService = app(LearningProgressService::class);
        $user = auth()->user();
        $progressByTraining = $progressService->getProgressForTrainings($trainings, $user);

        $trainings = $trainings->map(function ($training) use ($progressByTraining) {
            $learningProgress = $progressByTraining->get($training->id);

            $actionLabel = 'Commencer';

            if ($learningProgress['is_completed']) {
                $actionLabel = 'Revoir';
            } elseif ($learningProgress['has_started']) {
                $actionLabel = 'Continuer';
            }

            $targetLesson = $learningProgress['next_lesson'] ?: $learningProgress['first_lesson'];

            $actionUrl = $targetLesson
                ? route('learning.lesson', [
                    'training' => $training->id,
                    'lesson' => $targetLesson->id,
                ])
                : route('learning.show', [
                    'training' => $training->id,
                ]);

            return [
                'id' => $training->id,
                'title' => $training->title,
                'slug' => $training->slug,
                'excerpt' => $training->excerpt,
                'featured_image' => $training->featured_image,
                'lessons_count' => $learningProgress['total_lessons'],
                'completed_lessons' => $learningProgress['completed_lessons'],
                'progress' => $learningProgress['percentage'],
                'is_completed' => $learningProgress['is_completed'],
                'action_label' => $actionLabel,
                'action_url' => $actionUrl,
            ];
        });

        return inertia('Frontend/learning/index', [
            'trainings' => $trainings,
        ]);
    }

    public function show(Training $training)
    {
        $progressService = app(LearningProgressService::class);

        $progressService->ensureTrainingAccess($training, auth()->user());

        $isAdmin = auth()->user()->isAdmin();

        $training->load([
            'sections' => function ($query) use ($isAdmin) {
                $query->when(!$isAdmin, fn ($query) => $query->where('is_published', true))
                    ->orderBy('sort_order')->orderBy('id');
            },
            'sections.lessons' => function ($query) {
                $query->where('is_published', true)
                    ->orderBy('sort_order')
                    ->orderBy('id');
            },
            'sections.quiz' => function ($query) {
                $query->select(
                    'id',
                    'training_id',
                    'training_section_id',
                    'title',
                    'passing_score',
                    'is_published'
                );
            },
            'sections.lessons.resources' => function ($query) {
                $query->orderBy('sort_order');
            },
        ]);

        $progress = TrainingProgress::where('user_id', auth()->id())
            ->where('training_id', $training->id)
            ->get()
            ->keyBy('training_lesson_id');

        $sectionProgress = $progressService->getSectionProgressSummaries(
            $training,
            $training->sections,
            $progress,
            auth()->user()
        );

        return inertia('Frontend/learning/show', [
            'training' => $training,
            'progress' => $progress,
            'progress_percentage' => $training->progressPercentage(auth()->user()),
            'section_progress' => $sectionProgress,
        ]);
    }

    public function lesson(Training $training, TrainingLesson $lesson)
    {
        $progressService = app(LearningProgressService::class);

        $progressService->ensureLessonAccess($training, $lesson, auth()->user());

        $lesson->load([
            'section.quiz' => function ($query) {
                $query->select(
                    'id',
                    'training_id',
                    'training_section_id',
                    'title',
                    'passing_score',
                    'is_published'
                );
            },
            'resources',
        ]);

        $progress = TrainingProgress::where('user_id', auth()->id())
            ->where('training_id', $training->id)
            ->where('training_lesson_id', $lesson->id)
            ->first();

        $nextLesson = $progressService->getFollowingLesson($training, $lesson);

        $section = $lesson->section;

        $sectionLessonIds = $progressService->getSectionLessonIds($training, $section);

        $completedSectionLessonsCount = $progressService->countCompletedSectionLessons(
            $training,
            $section,
            auth()->id()
        );

        $canTakeQuiz = $progressService->canTakeQuiz(
            $training,
            $section,
            auth()->id()
        );

        return inertia('Frontend/learning/lesson', [
            'training' => $training,
            'section' => $section,
            'lesson' => $lesson,
            'resources' => $lesson->resources,
            'section_quiz' => $section?->quiz,
            'is_completed' => (bool) optional($progress)->completed,
            'next_lesson' => $nextLesson,
            'can_take_quiz' => $canTakeQuiz,
            'section_lessons_count' => $sectionLessonIds->count(),
            'section_completed_lessons_count' => $completedSectionLessonsCount,
        ]);
    }
}
