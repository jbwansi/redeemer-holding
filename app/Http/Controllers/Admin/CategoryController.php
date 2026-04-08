<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\EventCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str;


class CategoryController extends Controller
{
    public function index()
    {
        $this->synchronizeCatalogs();

        $categories = Category::withCount(['posts', 'events'])->orderBy('name')->get();
        return inertia('backend/blogs/categories/index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|max:255|unique:categories,name'
        ]);

        DB::transaction(function () use ($validated) {
            $category = Category::create([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name'])
            ]);

            $eventCategory = EventCategory::withTrashed()->firstOrNew(['id' => $category->id]);
            $eventCategory->name = $category->name;
            $eventCategory->slug = $category->slug;
            $eventCategory->description = $eventCategory->description ?? null;
            $eventCategory->color = $eventCategory->color ?? '#000000';
            $eventCategory->save();

            if ($eventCategory->trashed()) {
                $eventCategory->restore();
            }
        });

        return redirect()->back()->with('success', 'Catégorie créée avec succès');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|max:255|unique:categories,name,' . $category->id
        ]);

        DB::transaction(function () use ($validated, $category) {
            $category->update([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name'])
            ]);

            $eventCategory = EventCategory::withTrashed()->firstOrNew(['id' => $category->id]);
            $eventCategory->name = $category->name;
            $eventCategory->slug = $category->slug;
            $eventCategory->description = $eventCategory->description ?? null;
            $eventCategory->color = $eventCategory->color ?? '#000000';
            $eventCategory->save();

            if ($eventCategory->trashed()) {
                $eventCategory->restore();
            }
        });

        return redirect()->back()->with('success', 'Catégorie mise à jour avec succès');
    }

    public function destroy(Category $category)
    {
        if ($category->posts()->count() > 0 || $category->events()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer une catégorie liée à des articles ou des évènements.');
        }

        DB::transaction(function () use ($category) {
            $category->delete();

            EventCategory::where('id', $category->id)->delete();
        });

        return redirect()->back()->with('success', 'Catégorie supprimée avec succès');
    }

    private function synchronizeCatalogs(): void
    {
        // Ensure legacy event categories exist in the shared categories table.
        $now = now();
        foreach (EventCategory::withTrashed()->get(['id', 'name', 'slug']) as $eventCategory) {
            if (!Category::where('id', $eventCategory->id)->exists()) {
                $slug = $eventCategory->slug ?: Str::slug($eventCategory->name);
                if (Category::where('slug', $slug)->exists()) {
                    $slug = $slug . '-' . $eventCategory->id;
                }

                DB::table('categories')->insert([
                    'id' => $eventCategory->id,
                    'name' => $eventCategory->name,
                    'slug' => $slug,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Ensure every shared category has an event_categories mirror for FK compatibility.
        foreach (Category::get(['id', 'name', 'slug']) as $category) {
            $eventCategory = EventCategory::withTrashed()->firstOrNew(['id' => $category->id]);
            $eventCategory->name = $category->name;
            $eventCategory->slug = $category->slug;
            $eventCategory->description = $eventCategory->description ?? null;
            $eventCategory->color = $eventCategory->color ?? '#000000';
            $eventCategory->save();

            if ($eventCategory->trashed()) {
                $eventCategory->restore();
            }
        }
    }
}
