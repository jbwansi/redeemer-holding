<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingSection;
use Illuminate\Http\Request;

class TrainingSectionController extends Controller
{
    public function index(Training $training)
    {
        return inertia('backend/trainings/sections/index', [
            'training' => $training,
            'sections' => $training->sections()->withCount('lessons')->get(),
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
}