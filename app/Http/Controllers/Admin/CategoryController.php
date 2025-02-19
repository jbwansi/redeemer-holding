<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;


class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('name')->get();
        return inertia('backend/blogs/categories/index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|max:255|unique:categories,name'
        ]);

        Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name'])
        ]);

        return redirect()->back()->with('success', 'Catégorie créée avec succès');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|max:255|unique:categories,name,' . $category->id
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name'])
        ]);

        return redirect()->back()->with('success', 'Catégorie mise à jour avec succès');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Catégorie supprimée avec succès');
    }

}
