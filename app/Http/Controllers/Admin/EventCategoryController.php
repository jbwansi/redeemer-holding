<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use Illuminate\Http\Request;

class EventCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = EventCategory::withCount('events');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        return inertia('backend/events/categories/index', [
            'categories' => $query->paginate(10)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:event_categories',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7|regex:/^#[A-Fa-f0-9]{6}$/',
        ]);

        EventCategory::create($validated);
        return redirect()->back()->with('success', 'Catégorie créée avec succès.');
    }

    public function update(Request $request, $id)
    {
        // dd($request->all(), $id);
        $category = EventCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:event_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'color' => 'required|string|size:7|regex:/^#[A-Fa-f0-9]{6}$/',
        ]);

        $category->update($validated);
        return redirect()->back()->with('success', 'Catégorie mise à jour avec succès.');
    }

    public function destroy($id)
    {
        $category = EventCategory::findOrFail($id);
        if ($category->events()->count() > 0) {
            return back()->with('error', 'Impossible de supprimer - la catégorie contient des événements.');
        }

        $category->delete();
        return redirect()->back()->with('success', 'Catégorie supprimée avec succès.');
    }
}
