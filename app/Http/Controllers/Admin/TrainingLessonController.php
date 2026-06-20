<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingLesson;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    public function create(Training $training)
    {
        return inertia('backend/trainings/lessons/create', [
            'training' => $training,
            'sections' => $training->sections()->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request, Training $training)
    {
        $validated = $request->validate([
            'training_section_id' => ['required', 'exists:training_sections,id'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
        ]);

        $training->lessons()->create([
            ...$validated,
            'slug' => $this->generateUniqueSlug($validated['title']),
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return redirect()
            ->route('trainings.lessons.index', $training)
            ->with('success', 'Leçon créée avec succès.');
    }

    public function edit(Training $training, TrainingLesson $lesson)
    {
        $lesson->load('resources');

        return inertia('backend/trainings/lessons/edit', [
            'training' => $training,
            'lesson' => $lesson,
            'sections' => $training->sections()->orderBy('sort_order')->get(),
        ]);

    }

    public function update(
        Request $request,
        Training $training,
        TrainingLesson $lesson
    ) {
        $validated = $request->validate([
            'training_section_id' => ['required', 'exists:training_sections,id'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
        ]);

        $slug = $lesson->slug;
        if ($lesson->title !== $validated['title']) {
            $slug = $this->generateUniqueSlug($validated['title'], $lesson->id);
        }

        $lesson->update([
            ...$validated,
            'slug' => $slug,
        ]);

        return redirect()
            ->route('trainings.lessons.index', $training)
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
}