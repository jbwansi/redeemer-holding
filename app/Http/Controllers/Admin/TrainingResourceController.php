<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TrainingResourceController extends Controller
{
    public function index(Training $training, TrainingLesson $lesson)
    {
        $this->ensureLessonBelongsToTraining($training, $lesson);

        return inertia('backend/trainings/resources/index', [
            'training' => $training,
            'lesson' => $lesson,
            'resources' => $lesson->resources()->orderBy('sort_order')->get(),
        ]);
    }

    public function create(Training $training, TrainingLesson $lesson)
    {
        $this->ensureLessonBelongsToTraining($training, $lesson);

        return inertia('backend/trainings/resources/create', [
            'training' => $training,
            'lesson' => $lesson,
        ]);
    }

    public function store(Request $request, Training $training, TrainingLesson $lesson)
    {
        $this->ensureLessonBelongsToTraining($training, $lesson);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url', 'max:2000'],
            'file' => ['nullable', 'file', 'max:10240'],
            'file_type' => ['nullable', 'string', 'max:50'],
            'is_downloadable' => ['boolean'],
            'is_public' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['external_url']) && !$request->hasFile('file')) {
            throw ValidationException::withMessages([
                'file' => 'Veuillez ajouter un fichier ou une URL externe.',
            ]);
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('training-resources', 'public');
        }

        $lesson->resources()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'file_path' => $filePath,
            'file_disk' => 'public',
            'file_type' => $validated['file_type'] ?? null,
            'is_downloadable' => (bool) ($validated['is_downloadable'] ?? true),
            'is_public' => (bool) ($validated['is_public'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Ressource créée avec succès.');
    }

    public function edit(Training $training, TrainingLesson $lesson, TrainingResource $resource)
    {
        $this->ensureResourceBelongsToLesson($training, $lesson, $resource);

        return inertia('backend/trainings/resources/edit', [
            'training' => $training,
            'lesson' => $lesson,
            'resource' => $resource,
        ]);
    }

    public function update(Request $request, Training $training, TrainingLesson $lesson, TrainingResource $resource)
    {
        $this->ensureResourceBelongsToLesson($training, $lesson, $resource);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url', 'max:2000'],
            'file' => ['nullable', 'file', 'max:10240'],
            'file_type' => ['nullable', 'string', 'max:50'],
            'is_downloadable' => ['boolean'],
            'is_public' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['external_url']) && !$request->hasFile('file') && empty($resource->file_path)) {
            throw ValidationException::withMessages([
                'file' => 'Veuillez ajouter un fichier ou une URL externe.',
            ]);
        }

        $filePath = $resource->file_path;
        if ($request->hasFile('file')) {
            if (!empty($resource->file_path)) {
                Storage::disk($resource->file_disk ?: 'public')->delete($resource->file_path);
            }

            $filePath = $request->file('file')->store('training-resources', 'public');
        }

        $resource->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'file_path' => $filePath,
            'file_disk' => 'public',
            'file_type' => $validated['file_type'] ?? null,
            'is_downloadable' => (bool) ($validated['is_downloadable'] ?? true),
            'is_public' => (bool) ($validated['is_public'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Ressource mise à jour avec succès.');
    }

    public function destroy(Training $training, TrainingLesson $lesson, TrainingResource $resource)
    {
        $this->ensureResourceBelongsToLesson($training, $lesson, $resource);

        if (!empty($resource->file_path)) {
            Storage::disk($resource->file_disk ?: 'public')->delete($resource->file_path);
        }

        $resource->delete();

        return back()->with('success', 'Ressource supprimée avec succès.');
    }

    public function reorder(Request $request, Training $training, TrainingLesson $lesson)
    {
        $this->ensureLessonBelongsToTraining($training, $lesson);

        $validated = $request->validate([
            'resource_ids' => ['required', 'array', 'min:1'],
            'resource_ids.*' => ['integer', 'exists:training_resources,id'],
        ]);

        $resourceIds = $validated['resource_ids'];

        $count = TrainingResource::where('training_lesson_id', $lesson->id)
            ->whereIn('id', $resourceIds)
            ->count();

        abort_unless($count === count($resourceIds), 422, 'Liste de ressources invalide.');

        foreach ($resourceIds as $index => $resourceId) {
            TrainingResource::where('id', $resourceId)
                ->where('training_lesson_id', $lesson->id)
                ->update([
                    'sort_order' => $index,
                ]);
        }

        return back()->with('success', 'Ordre des ressources mis a jour.');
    }

    private function ensureLessonBelongsToTraining(Training $training, TrainingLesson $lesson): void
    {
        abort_unless((int) $lesson->training_id === (int) $training->id, 404);
    }

    private function ensureResourceBelongsToLesson(Training $training, TrainingLesson $lesson, TrainingResource $resource): void
    {
        $this->ensureLessonBelongsToTraining($training, $lesson);
        abort_unless((int) $resource->training_lesson_id === (int) $lesson->id, 404);
    }
}