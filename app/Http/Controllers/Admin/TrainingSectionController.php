<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrainingSectionController extends Controller
{
    public function index(Training $training)
    {
        return inertia('backend/trainings/sections/index', [
            'training' => [
                'id' => $training->id,
                'title' => $training->title,
                'slug' => $training->slug,
            ],
            'sections' => $training->sections()
                ->with([
                    'lessons' => function ($query) {
                        $query->orderBy('sort_order');
                    }
                ])
                ->withCount('lessons')
                ->orderBy('sort_order')
                ->get(),
        ]);
    }

    public function create(Training $training)
    {
        return inertia('backend/trainings/sections/create', [
            'training' => $training,
        ]);
    }

    public function store(Request $request, Training $training)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
        ]);

        $training->sections()->create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return redirect()
            ->route('trainings.sections.index', $training)
            ->with('success', 'Module créé avec succès.');
    }

    public function edit(Training $training, TrainingSection $section)
    {
        return inertia('backend/trainings/sections/edit', [
            'training' => $training,
            'section' => $section,
        ]);
    }

    public function update(Request $request, Training $training, TrainingSection $section)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
        ]);

        $section->update($validated);

        return redirect()
            ->route('trainings.sections.index', $training)
            ->with('success', 'Module mis à jour.');
    }

    public function destroy(Training $training, TrainingSection $section)
    {
        $section->delete();

        return back()->with('success', 'Module supprimé.');
    }

    public function reorder(Request $request, Training $training)
    {
        $validated = $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.id' => ['required', 'integer', 'exists:training_sections,id'],
            'sections.*.sort_order' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated, $training) {
            foreach ($validated['sections'] as $sectionData) {
                TrainingSection::where('id', $sectionData['id'])
                    ->where('training_id', $training->id)
                    ->update([
                        'sort_order' => $sectionData['sort_order'],
                    ]);
            }
        });

        return back()->with('success', 'Ordre des modules mis à jour.');
    }
}