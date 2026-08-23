<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Services\ServiceJsonExporter;
use App\Services\ServiceJsonImportAnalyzer;
use App\Services\ServiceJsonImporter;
use App\Services\ServiceJsonUpdateApplier;
use App\Services\ServicePackageAnalyzer;
use App\Services\ServicePackageExporter;
use App\Services\ServicePackageImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function __construct(
        private readonly ServiceJsonExporter $jsonExporter,
        private readonly ServiceJsonImportAnalyzer $jsonAnalyzer,
        private readonly ServiceJsonImporter $jsonImporter,
        private readonly ServiceJsonUpdateApplier $updateApplier,
        private readonly ServicePackageExporter $packageExporter,
        private readonly ServicePackageAnalyzer $packageAnalyzer,
        private readonly ServicePackageImporter $packageImporter,
    ) {}

    public function importExport()
    {
        return inertia('backend/services/import-export', [
            'services' => Service::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'analysis' => session('service_import_analysis'),
            'importResult' => session('service_import_result'),
            'updateResult' => session('service_update_result'),
        ]);
    }

    public function exportJson(Service $service)
    {
        $filename = 'redeemer-service-'.Str::slug($service->slug ?: $service->name).'.json';

        return response()->streamDownload(
            fn () => print ($this->jsonExporter->json($service)),
            $filename,
            ['Content-Type' => 'application/json; charset=UTF-8']
        );
    }

    public function exportPackage(Service $service)
    {
        $path = $this->packageExporter->export($service);
        $filename = 'redeemer-service-'.Str::slug($service->slug ?: $service->name).'.zip';

        return response()->download($path, $filename, ['Content-Type' => 'application/zip'])
            ->deleteFileAfterSend(true);
    }

    public function analyzeImport(Request $request)
    {
        $file = $this->validatedImportFile($request);
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'zip') {
            try {
                $package = $this->packageAnalyzer->analyze($file->getRealPath(), $file->getClientOriginalName());
                $analysis = $package['analysis'];
                $analysis['package'] = $package['package'];
            } catch (\DomainException $exception) {
                $analysis = [
                    'valid' => false,
                    'status' => 'invalid',
                    'errors' => [$exception->getMessage()],
                    'warnings' => [],
                    'package' => ['valid' => false, 'integrity' => 'invalid'],
                ];
            }
        } else {
            $contents = file_get_contents($file->getRealPath());
            $analysis = $this->jsonAnalyzer->analyze($contents === false ? '' : $contents, $file->getClientOriginalName());
        }

        return redirect()->route('services.import-export')->with('service_import_analysis', $analysis);
    }

    public function createFromJson(Request $request)
    {
        $file = $this->validatedImportFile($request);
        $extension = strtolower($file->getClientOriginalExtension());
        $contents = file_get_contents($file->getRealPath());

        try {
            $result = $extension === 'zip'
                ? $this->packageImporter->import($file->getRealPath(), 'create', (int) Auth::id(), $file->getClientOriginalName())
                : $this->jsonImporter->import($contents === false ? '' : $contents, (int) Auth::id(), $file->getClientOriginalName());
        } catch (\DomainException $exception) {
            return back()->withErrors(['file' => $exception->getMessage()]);
        } catch (\Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Throwable) {
            return back()->withErrors(['file' => 'La création a échoué. Aucune donnée n’a été modifiée.']);
        }

        return redirect()->route('services.import-export')
            ->with('success', 'Service importé avec succès.')
            ->with('service_import_result', $result);
    }

    public function updateFromJson(Request $request)
    {
        $file = $this->validatedImportFile($request);
        $extension = strtolower($file->getClientOriginalExtension());
        $contents = file_get_contents($file->getRealPath());

        try {
            $result = $extension === 'zip'
                ? $this->packageImporter->import($file->getRealPath(), 'update', (int) Auth::id(), $file->getClientOriginalName())
                : $this->updateApplier->apply($contents === false ? '' : $contents, $file->getClientOriginalName());
        } catch (\DomainException $exception) {
            return back()->withErrors(['file' => $exception->getMessage()]);
        } catch (\Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Throwable) {
            return back()->withErrors(['file' => 'La mise à jour a échoué. Aucune donnée n’a été modifiée.']);
        }

        return redirect()->route('services.import-export')
            ->with('success', 'Service mis à jour avec succès.')
            ->with('service_update_result', $result);
    }

    private function validatedImportFile(Request $request): \Illuminate\Http\UploadedFile
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400'],
        ], [
            'file.required' => 'Sélectionnez un fichier JSON ou ZIP.',
            'file.file' => 'Le fichier sélectionné n’est pas valide.',
            'file.max' => 'Le package ne doit pas dépasser 100 Mo.',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, ['json', 'zip'], true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'file' => 'Le fichier sélectionné doit être un fichier JSON ou ZIP.',
            ]);
        }
        if ($extension === 'json') {
            if ($file->getSize() > 2 * 1024 * 1024) {
                throw \Illuminate\Validation\ValidationException::withMessages(['file' => 'Le fichier JSON ne doit pas dépasser 2 Mo.']);
            }
            $allowedMimeTypes = ['application/json', 'text/json', 'text/plain', 'application/octet-stream'];
            if (! in_array($file->getMimeType(), $allowedMimeTypes, true)) {
                throw \Illuminate\Validation\ValidationException::withMessages(['file' => 'Le type du fichier JSON n’est pas accepté.']);
            }
        }

        return $file;
    }

    public function index(Request $request)
    {
        $query = Service::query()
            ->when(
                $request->search,
                fn ($q, $search) => $q->where('name', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
            )
            ->when(
                $request->status,
                fn ($q, $status) => match ($status) {
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
                $validated['image'] = '/storage/'.$path;
            }

            Service::create([
                ...$validated,
                'slug' => rand(1000, 9999).'-'.Str::slug($validated['name']),
                'user_id' => Auth::id(),
            ]);

            return redirect()->route('services.index')->with('success', 'Service créé avec succès.');
        } catch (\Exception $e) {
            report($e);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: '.$e->getMessage()])
                ->withInput();
        }
    }

    // edite & update
    public function edit(Service $service)
    {
        return inertia('backend/services/edit', [
            'service' => $service,
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
                $validated['image'] = '/storage/'.$path;
            }

            $service->update($validated);

            return redirect()->route('services.index')->with('success', 'Service mis à jour avec succès.');
        } catch (\Exception $e) {
            report($e);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: '.$e->getMessage()])
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
            'service' => $service,
        ]);
    }

    public function toggleStatus(Service $service)
    {
        $service->update(['status' => ! $service->status]);

        return redirect()->route('services.index')->with('success', 'Statut du service mis à jour avec succès.');
    }

    public function toggleHome(Service $service)
    {
        if (! $service->position) {
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
