<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function __construct()
    {
    }
    public function index(Request $request)
    {
        $query = Service::query()
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
            )
            ->when(
                $request->status,
                fn($q, $status) => match ($status) {
                    'active' => $q->where('status', true),
                    'inactive' => $q->where('status', false),
                    default => $q
                }
            )
            ->orderBy('created_at', 'desc');

        return inertia('backend/services/index', [
            'services' => $query->paginate(12),
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => Service::count(),
                'active' => Service::where('status', true)->count(),
                'inactive' => Service::where('status', false)->count(),
            ],
        ]);
    }
    public function create()
    {
        return inertia('backend/services/create');
    }

    public function store(ServiceRequest $request)
    {
        try {
            $validated = $request->validated();

            if (isset($validated['ideal_for']) && is_string($validated['ideal_for'])) {
                $validated['ideal_for'] = json_decode($validated['ideal_for'], true);
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('services', 'public');
                $validated['image'] = '/storage/' . $path;
            }

            Service::create([
                ...$validated,
                'slug' => rand(1000, 9999) . '-' . Str::slug($validated['name']),
                'user_id' => Auth::id(),
            ]);

            return redirect()->route('services.index')->with('success', 'Service créé avec succès.');
        } catch (\Exception $e) {
            report($e);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()])
                ->withInput();
        }
    }
    //edite & update
    public function edit(Service $service)
    {
        return inertia('backend/services/edit', [
            'service' => $service
        ]);
    }
    public function update(ServiceRequest $request, Service $service)
    {
        try {
            $validated = $request->validated();

            if (isset($validated['ideal_for']) && is_string($validated['ideal_for'])) {
                $validated['ideal_for'] = json_decode($validated['ideal_for'], true);
            }


            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('services', 'public');
                $validated['image'] = '/storage/' . $path;
            }

            $service->update($validated);

            return redirect()->route('services.index')->with('success', 'Service mis à jour avec succès.');
        } catch (\Exception $e) {
            report($e);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()])
                ->withInput();
        }
    }
    public function destroy(Service $service)
    {
        $service->delete();
        return redirect()->route('services.index')->with('success', 'Service supprimé avec succès.');
    }
    public function show(Service $service)
    {

        $service->increment('views');

        $service->refresh();

        return inertia('backend/services/show', [
            'service' => $service
        ]);
    }
    public function toggleStatus(Service $service)
    {
        $service->update(['status' => !$service->status]);
        return redirect()->route('services.index')->with('success', 'Statut du service mis à jour avec succès.');
    }

    public function toggleHome(Service $service)
    {
        if (!$service->position) {
            $count = Service::whereNotNull('position')->count();

            if ($count >= 3) {
                return back()->withErrors([
                    'home' => 'Maximum 3 services sur la page d’accueil.',
                ]);
            }

            $max = Service::whereNotNull('position')->max('position') ?? 0;

            $service->update([
                'position' => $max + 1,
            ]);
        } else {
            $service->update([
                'position' => null,
            ]);

            Service::whereNotNull('position')
                ->orderBy('position')
                ->get()
                ->values()
                ->each(function ($item, $index) {
                    $item->update([
                        'position' => $index + 1,
                    ]);
                });
        }

        return redirect()->route('services.index')
            ->with('success', 'Affichage accueil mis à jour.');
    }

    public function reorderHome(Request $request)
    {
        $data = $request->validate([
            'services' => ['required', 'array', 'max:3'],
            'services.*.id' => ['required', 'exists:services,id'],
            'services.*.position' => ['required', 'integer', 'min:1', 'max:3'],
        ]);

        foreach ($data['services'] as $item) {
            Service::where('id', $item['id'])->update([
                'position' => $item['position'],
            ]);
        }

        return back()->with('success', 'Ordre mis à jour.');
    }
}
