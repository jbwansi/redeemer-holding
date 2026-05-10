<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageContentController extends Controller
{
    public function index()
    {
        $pages = ['services', 'formations', 'events'];

        $contents = PageContent::whereIn('page', $pages)
            ->get()
            ->groupBy('page')
            ->map(fn ($items) => $items->pluck('value', 'key'));

        return Inertia::render('backend/pagecontents/Index', [
            'contents' => $contents,
        ]);
    }

    public function update(Request $request)
{
    $request->validate([
        'page' => 'required|string|in:services,formations,events',
        'data' => 'required|array',
        'data.*' => 'nullable',
    ]);

    foreach ($request->input('data', []) as $key => $value) {
        PageContent::updateOrCreate(
            [
                'page' => $request->page,
                'key' => $key,
            ],
            [
                'value' => $value,
            ]
        );
    }

    foreach ($request->file('data', []) as $key => $file) {
        if ($file && $file->isValid()) {
            $path = $file->store('page-content', 'public');

            PageContent::updateOrCreate(
                [
                    'page' => $request->page,
                    'key' => $key,
                ],
                [
                    'value' => '/storage/' . $path,
                ]
            );
        }
    }

    return back()->with('success', 'Contenu mis à jour avec succès.');
}
}