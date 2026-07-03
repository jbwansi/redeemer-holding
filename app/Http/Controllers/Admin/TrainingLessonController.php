<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingLessonRequest;
use App\Http\Requests\UpdateTrainingLessonRequest;
use App\Models\Training;
use App\Models\TrainingLesson;
use Illuminate\Support\Str;
use App\Models\TrainingSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrainingLessonController extends Controller
{
    public function index(Training $training)
    {
        return inertia('backend/trainings/lessons/index', [
            'training' => $training,
            'sections' => $training->sections()
                ->with([
                    'lessons' => function ($query) {
                        $query->with([
                            'progress' => function ($q) {
                                $q->where('user_id', auth()->id());
                            }
                        ])->orderBy('sort_order');
                    }
                ])
                ->orderBy('sort_order')
                ->get(),
        ]);
    }

    public function create(Training $training, TrainingSection $section)
    {
        return inertia('backend/trainings/lessons/create', [
            'training' => $training,
            'section' => $section,
        ]);
    }

    public function edit(Training $training, TrainingSection $section, TrainingLesson $lesson)
    {
        $lesson->load([
            'resources' => function ($query) {
                $query->orderBy('sort_order');
            }
        ]);

        return inertia('backend/trainings/lessons/edit', [
            'training' => $training,
            'section' => $section,
            'lesson' => $lesson,
        ]);
    }

    public function store(StoreTrainingLessonRequest $request, Training $training, TrainingSection $section)
    {
        $validated = $request->validated();

        $section->lessons()->create([
            ...$validated,
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'slug' => Str::slug($validated['title']),
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_free' => $validated['is_free'] ?? false,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return redirect()
            ->route('trainings.sections.index', $training)
            ->with('success', 'Leçon créée avec succès.');
    }


    public function update(UpdateTrainingLessonRequest $request, Training $training, TrainingSection $section, TrainingLesson $lesson)
    {
        $validated = $request->validated();

        $lesson->update([
            ...$validated,
            'slug' => $lesson->title !== $validated['title']
                ? Str::slug($validated['title'])
                : $lesson->slug,
            'is_free' => $validated['is_free'] ?? false,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return redirect()
            ->route('trainings.sections.index', $training)
            ->with('success', 'Leçon mise à jour.');
    }

    public function destroy(Training $training, TrainingLesson $lesson)
    {
        $lesson->delete();

        return back()->with(
            'success',
            'Leçon supprimée avec succès.'
        );
    }
    public function show(Training $training, TrainingLesson $lesson)
    {
        $lesson->load('section');

        $lessons = $training->lessons()
            ->orderBy('training_section_id')
            ->orderBy('sort_order')
            ->get();

        $currentIndex = $lessons->search(fn($item) => $item->id === $lesson->id);

        $previousLesson = $currentIndex > 0
            ? $lessons[$currentIndex - 1]
            : null;

        $nextLesson = $currentIndex !== false && $currentIndex < $lessons->count() - 1
            ? $lessons[$currentIndex + 1]
            : null;

        return inertia('backend/trainings/lessons/show', [
            'training' => $training,
            'lesson' => $lesson,
            'previousLesson' => $previousLesson,
            'nextLesson' => $nextLesson,
        ]);
    }

    private function generateUniqueSlug(string $title, ?int $ignoreLessonId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $suffix = 2;

        while (
            TrainingLesson::query()
                ->when($ignoreLessonId, fn($q) => $q->where('id', '!=', $ignoreLessonId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    public function reorder(Request $request, Training $training, TrainingSection $section)
    {
        $validated = $request->validate([
            'lessons' => ['required', 'array'],
            'lessons.*.id' => ['required', 'integer', 'exists:training_lessons,id'],
            'lessons.*.sort_order' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated, $training, $section) {
            foreach ($validated['lessons'] as $lessonData) {
                TrainingLesson::where('id', $lessonData['id'])
                    ->where('training_id', $training->id)
                    ->where('training_section_id', $section->id)
                    ->update([
                        'sort_order' => $lessonData['sort_order'],
                    ]);
            }
        });

        return back()->with('success', 'Ordre des leçons mis à jour.');
    }
}