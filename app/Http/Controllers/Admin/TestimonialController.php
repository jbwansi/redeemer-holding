<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Models\Service;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::latest()->get();
        $services = Service::all();

        return inertia('backend/testimonials/index', [
            'testimonials' => $testimonials,
            'services' => $services,
        ]);
    }

    public function create()
    {
        return inertia('backend/testimonials/create', [
            'services' => Service::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'photo' => 'nullable|image|max:2048',
            'service_id' => 'nullable|exists:services,id',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = '/storage/' . $request->file('photo')->store('testimonials', 'public');
        }

        $data['rating'] = $data['rating'] ?? 5;
        $data['is_active'] = $request->boolean('is_active', true);

        Testimonial::create($data);

        return redirect()->route('testimonials.index')
            ->with('success', 'Témoignage créé');
    }

    public function edit(Testimonial $testimonial)
    {
        return inertia('backend/testimonials/edit', [
            'testimonial' => $testimonial,
            'services' => Service::all(),
        ]);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'photo' => 'nullable|image|max:2048',
            'service_id' => 'nullable|exists:services,id',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = '/storage/' . $request->file('photo')->store('testimonials', 'public');
        }

        $data['rating'] = $data['rating'] ?? 5;
        $data['is_active'] = $request->boolean('is_active', true);

        $testimonial->update($data);

        return redirect()->route('testimonials.index')
            ->with('success', 'Témoignage mis à jour');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        return back()->with('success', 'Supprimé');
    }

    // 🔥 TOGGLE ACCUEIL
    public function toggleHome(Testimonial $testimonial)
    {
        if ($testimonial->position) {
            $testimonial->update(['position' => null]);
        } else {
            $count = Testimonial::whereNotNull('position')->count();

            if ($count >= 3) {
                return back()->withErrors('Maximum 3 témoignages');
            }

            $testimonial->update([
                'position' => $count + 1
            ]);
        }

        return back();
    }

    // 🔥 REORDER
    public function reorderHome(Request $request)
    {
        foreach ($request->testimonials as $item) {
            Testimonial::where('id', $item['id'])
                ->update(['position' => $item['position']]);
        }

        return back();
    }

    public function toggleFeatured(Testimonial $testimonial)
    {
        $testimonial->update([
            'is_featured' => !$testimonial->is_featured,
        ]);

        return back()->with('success', 'Mise en avant mise à jour.');
    }
}