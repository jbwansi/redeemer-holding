<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function edit()
    {
        $page = Page::query()->firstOrCreate(
            ['slug' => 'a-propos'],
            [
                'title'   => 'A propos',
                'content' => '',
                'status'  => true,
                'user_id' => Auth::id() ?? User::query()->value('id'),
            ]
        );

        return Inertia::render('backend/about/edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta'    => 'nullable|array',
        ]);

        $page = Page::where('slug', 'a-propos')->firstOrFail();
        $page->update($validated);

        return back()->with('success', 'A propos mis à jour avec succès.');
    }
}
