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
            ->orderBy('id')
            ->withCount([
                'lessons as lessons_count' => function ($query) {
                    $query->where('is_published', true);
                },
            ])
            ->with([
                'lessons' => function ($query) {
                    $query->select('id', 'training_id', 'training_section_id', 'sort_order')
                        ->where('is_published', true)
                        ->orderBy('training_section_id')
                        ->orderBy('sort_order')
                        ->orderBy('id');
                },
            ])
            ->get();

        $completedProgressByTraining = TrainingProgress::where('user_id', auth()->id())
            ->whereIn('training_id', $trainings->pluck('id'))
            ->where('completed', true)
            ->get(['training_id', 'training_lesson_id'])
            ->groupBy('training_id');

        $trainings = $trainings->map(function ($training) use ($completedProgressByTraining) {
            $publishedLessons = $training->lessons;
            $lessonCount = $training->lessons_count ?? 0;

            $completedLessonIds = $completedProgressByTraining
                ->get($training->id, collect())
                ->pluck('training_lesson_id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $completedLessons = $publishedLessons
                ->filter(fn ($lesson) => in_array((int) $lesson->id, $completedLessonIds, true))
                ->count();

            $progress = $lessonCount > 0
                ? (int) round(($completedLessons / $lessonCount) * 100)
                : 0;

            $firstLesson = $publishedLessons->first();

            $resumeLesson = $publishedLessons
                ->first(fn ($lesson) => !in_array((int) $lesson->id, $completedLessonIds, true));

            $actionLabel = 'Commencer';

            if ($progress === 100) {
                $actionLabel = 'Revoir';
            } elseif ($completedLessons > 0) {
                $actionLabel = 'Continuer';
            }

            $targetLesson = $resumeLesson ?: $firstLesson;

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
                'lessons_count' => $training->lessons_count,
                'completed_lessons' => $completedLessons,
                'progress' => $progress,
                'is_completed' => $progress === 100,
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

        $training->load([
            'sections' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
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

        $sectionProgress = $training->sections->mapWithKeys(function ($section) use (
            $progress,
            $progressService,
            $training
        ) {
            $totalLessons = $section->lessons->count();

            $completedLessons = $section->lessons
                ->filter(function ($lesson) use ($progress) {
                    return (bool) optional($progress->get($lesson->id))->completed;
                })
                ->count();

            $percentage = $totalLessons > 0
                ? (int) round(($completedLessons / $totalLessons) * 100)
                : 0;

            return [
                (string) $section->id => [
                    'completed_lessons' => $completedLessons,
                    'total_lessons' => $totalLessons,
                    'progress_percentage' => $percentage,
                    'is_completed' => $progressService->isSectionCompleted(
                        $training,
                        $section,
                        auth()->id()
                    ),
                    'can_access' => $progressService->canAccessSection(
                        $training,
                        $section,
                        auth()->id()
                    ),
                    'can_take_quiz' => $progressService->canTakeQuiz(
                        $training,
                        $section,
                        auth()->id()
                    ),
                ],
            ];
        });

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

        $progressService->ensureTrainingAccess($training, auth()->user());

        abort_unless((int) $lesson->training_id === (int) $training->id, 404);

        $lesson->load('section');

        $progressService->ensureCanAccessSection(
            $training,
            $lesson->section,
            auth()->id()
        );

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

        $nextLesson = TrainingLesson::where('training_id', $training->id)
            ->where('is_published', true)
            ->where(function ($query) use ($lesson) {
                $query->where('sort_order', '>', $lesson->sort_order)
                    ->orWhere(function ($nestedQuery) use ($lesson) {
                        $nestedQuery->where('sort_order', $lesson->sort_order)
                            ->where('id', '>', $lesson->id);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->first();

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