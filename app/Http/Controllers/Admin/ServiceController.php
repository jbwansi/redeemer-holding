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
    public function __construct() {}
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
            'filters' => $request->only(['search', 'status'])
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

            $service = Service::create([
                ...$validated,
                'slug' => rand(1000, 9999) . '-' . Str::slug($validated['name']),
                'user_id' => Auth::id()
            ]);
            return redirect()->route('services.index')->with('success', 'Service created successfully');
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

            $service->update([
                ...$validated,
                // 'slug' => rand(1000, 9999) . '-' . Str::slug($validated['name']),
            ]);
            return redirect()->route('services.index')->with('success', 'Service updated successfully');
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
        return redirect()->route('services.index')->with('success', 'Service deleted successfully');
    }
    public function show(Service $service)
    {
        return inertia('backend/services/show', [
            'service' => $service
        ]);
    }
    public function toggleStatus(Service $service)
    {
        $service->update(['status' => !$service->status]);
        return redirect()->route('services.index')->with('success', 'Service status updated successfully');
    }
}
