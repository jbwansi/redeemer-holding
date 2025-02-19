<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PageRequest;
use App\Models\Page;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $query = Page::query()
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
            )
            ->when(
                $request->status && $request->status !== 'all',
                fn($q) => $q->where('status', $request->status === 'active')
            )
            ->when(
                $request->sort && $request->direction,
                fn($q) => $q->orderBy($request->sort, $request->direction),
                fn($q) => $q->latest()
            );

        $pageActives = Page::where('status', 1)->get();
        $businessSettings = Setting::all();
        return inertia('backend/pages/index', [
            'pages' => $query->paginate(10),
            'businessSettings' => $businessSettings,
            'pageActives' => $pageActives,
            'filters' => $request->only(['search', 'status', 'sort', 'direction'])
        ]);
    }

    public function create()
    {
        return inertia('backend/pages/create');
    }

    public function store(PageRequest $request)
    {
        try {
            $validated = $request->validated();

            $page = Page::create([
                ...$validated,
                'user_id' => Auth::id(),
                'slug' => rand(1000, 9999) . '-' . Str::slug($validated['title']),
            ]);
            return redirect()->route('pages.index')->with('success', 'Page crée avec succès');
        } catch (\Exception $e) {
            report($e);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show($slug)
    {
        $page = Page::where('slug', $slug)->firstOrFail();
        return inertia('backend/pages/show', [
            'page' => $page
        ]);
    }

    public function edit(Page $page)
    {
        return inertia('backend/pages/edit', [
            'page' => $page
        ]);
    }

    public function update(PageRequest $request, Page $page)
    {
        try {
            $validated = $request->validated();

            $page->update([
                ...$validated,
                'slug' => rand(1000, 9999) . '-' . Str::slug($validated['title']),
            ]);
            return redirect()->route('pages.index')->with('success', 'Page mise à jour avec suceess');
        } catch (\Exception $e) {
            report($e);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return redirect()->route('pages.index')->with('success', 'Page supprimée avec succès');
    }
}
