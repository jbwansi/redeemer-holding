<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Services\ImageService;
use App\Services\LegacyTrainingContentJsonAdapter;
use App\Services\TrainingContentImporter;
use App\Services\TrainingJsonExporter;
use App\Services\TrainingJsonImportAnalyzer;
use App\Services\TrainingJsonImporter;
use App\Services\TrainingJsonUpdateApplier;
use App\Services\TrainingJsonUpdatePlanner;
use App\Services\TrainingPackageAnalyzer;
use App\Services\TrainingPackageExporter;
use App\Services\TrainingPackageImporter;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TrainingController extends Controller
{
    protected $imageService;

    protected TrainingJsonExporter $trainingJsonExporter;

    protected TrainingJsonImportAnalyzer $trainingJsonImportAnalyzer;

    protected TrainingJsonImporter $trainingJsonImporter;

    protected LegacyTrainingContentJsonAdapter $legacyTrainingContentJsonAdapter;

    protected TrainingContentImporter $trainingContentImporter;

    protected TrainingJsonUpdatePlanner $trainingJsonUpdatePlanner;

    protected TrainingJsonUpdateApplier $trainingJsonUpdateApplier;

    protected TrainingPackageExporter $trainingPackageExporter;

    protected TrainingPackageAnalyzer $trainingPackageAnalyzer;

    protected TrainingPackageImporter $trainingPackageImporter;

    public function __construct(
        ImageService $imageService,
        TrainingJsonExporter $trainingJsonExporter,
        TrainingJsonImportAnalyzer $trainingJsonImportAnalyzer,
        TrainingJsonImporter $trainingJsonImporter,
        LegacyTrainingContentJsonAdapter $legacyTrainingContentJsonAdapter,
        TrainingContentImporter $trainingContentImporter,
        TrainingJsonUpdatePlanner $trainingJsonUpdatePlanner,
        TrainingJsonUpdateApplier $trainingJsonUpdateApplier,
        TrainingPackageExporter $trainingPackageExporter,
        TrainingPackageAnalyzer $trainingPackageAnalyzer,
        TrainingPackageImporter $trainingPackageImporter
    ) {
        $this->imageService = $imageService;
        $this->trainingJsonExporter = $trainingJsonExporter;
        $this->trainingJsonImportAnalyzer = $trainingJsonImportAnalyzer;
        $this->trainingJsonImporter = $trainingJsonImporter;
        $this->legacyTrainingContentJsonAdapter = $legacyTrainingContentJsonAdapter;
        $this->trainingContentImporter = $trainingContentImporter;
        $this->trainingJsonUpdatePlanner = $trainingJsonUpdatePlanner;
        $this->trainingJsonUpdateApplier = $trainingJsonUpdateApplier;
        $this->trainingPackageExporter = $trainingPackageExporter;
        $this->trainingPackageAnalyzer = $trainingPackageAnalyzer;
        $this->trainingPackageImporter = $trainingPackageImporter;
    }

    public function importExport()
    {
        return inertia('backend/trainings/import-export', [
            'trainings' => Training::query()
                ->orderBy('title')
                ->get(['id', 'title', 'slug']),
            'analysis' => session('training_import_analysis'),
            'importResult' => session('training_import_result'),
            'updateResult' => session('training_update_result'),
        ]);
    }

    public function exportJson(Training $training)
    {
        $filename = 'redeemer-training-'.Str::slug($training->slug ?: $training->title).'.json';

        return response()->streamDownload(
            fn () => print ($this->trainingJsonExporter->json($training)),
            $filename,
            ['Content-Type' => 'application/json; charset=UTF-8']
        );
    }

    public function exportPackage(Training $training)
    {
        $path = $this->trainingPackageExporter->export($training);
        $filename = 'redeemer-training-'.Str::slug($training->slug ?: $training->title).'.zip';

        return response()->download($path, $filename, ['Content-Type' => 'application/zip'])
            ->deleteFileAfterSend(true);
    }

    public function analyzeImport(Request $request)
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
            return back()->withErrors(['file' => 'Le fichier sélectionné doit être un fichier JSON ou ZIP.']);
        }
        if ($extension === 'zip') {
            try {
                $package = $this->trainingPackageAnalyzer->analyze($file->getRealPath(), $file->getClientOriginalName());
                $analysis = $package['analysis'];
                $analysis['package'] = $package['package'];
                if ($analysis['valid'] && $analysis['status'] === 'existing') {
                    $analysis['update_plan'] = $this->trainingJsonUpdatePlanner->plan(json_decode($package['training_json'], true, 512, JSON_THROW_ON_ERROR));
                }
            } catch (\DomainException $exception) {
                $analysis = ['valid' => false, 'status' => 'invalid', 'errors' => [$exception->getMessage()], 'warnings' => [], 'package' => ['valid' => false, 'integrity' => 'invalid']];
            }

            return redirect()->route('trainings.import-export')->with('training_import_analysis', $analysis);
        }
        if ($file->getSize() > 2 * 1024 * 1024) {
            return back()->withErrors(['file' => 'Le fichier JSON ne doit pas dépasser 2 Mo.']);
        }

        $allowedMimeTypes = ['application/json', 'text/json', 'text/plain', 'application/octet-stream'];
        if (! in_array($file->getMimeType(), $allowedMimeTypes, true)) {
            return back()->withErrors(['file' => 'Le type du fichier JSON n’est pas accepté.']);
        }

        $contents = file_get_contents($file->getRealPath());
        $contents = $contents === false ? '' : $contents;

        if (app()->environment('local', 'testing')) {
            json_decode($contents, true);
            Log::debug('Fichier reçu pour analyse d’un export de formation.', [
                'filename' => $file->getClientOriginalName(),
                'uploaded_size' => $file->getSize(),
                'content_length' => strlen($contents),
                'sha256' => hash('sha256', $contents),
                'first_bytes_hex' => bin2hex(substr($contents, 0, 8)),
                'json_error' => json_last_error_msg(),
            ]);
        }

        $analysis = $this->trainingJsonImportAnalyzer->analyze(
            $contents,
            $file->getClientOriginalName()
        );

        if ($analysis['valid'] && $analysis['status'] === 'existing') {
            $package = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
            $analysis['update_plan'] = $this->trainingJsonUpdatePlanner->plan($package);
        }

        return redirect()->route('trainings.import-export')
            ->with('training_import_analysis', $analysis);
    }

    public function createFromJson(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400'],
        ], [
            'file.required' => 'Sélectionnez à nouveau le fichier JSON à importer.',
            'file.file' => 'Le fichier sélectionné n’est pas valide.',
            'file.max' => 'Le fichier JSON ne doit pas dépasser 2 Mo.',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, ['json', 'zip'], true)) {
            return back()->withErrors(['file' => 'Le fichier sélectionné doit être un fichier JSON ou ZIP.']);
        }

        $allowedMimeTypes = ['application/json', 'text/json', 'text/plain', 'application/octet-stream'];
        if ($extension === 'json' && ! in_array($file->getMimeType(), $allowedMimeTypes, true)) {
            return back()->withErrors(['file' => 'Le type du fichier JSON n’est pas accepté.']);
        }

        $contents = file_get_contents($file->getRealPath());

        try {
            $result = $extension === 'zip'
                ? $this->trainingPackageImporter->import($file->getRealPath(), 'create', $file->getClientOriginalName())
                : $this->trainingJsonImporter->import($contents === false ? '' : $contents, $file->getClientOriginalName());
        } catch (\DomainException $exception) {
            return back()->withErrors(['file' => $exception->getMessage()]);
        } catch (\Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Throwable) {
            return back()->withErrors([
                'file' => 'L’import a échoué. Aucune donnée n’a été modifiée.',
            ]);
        }

        return redirect()->route('trainings.import-export')
            ->with('success', 'Formation importée avec succès.')
            ->with('training_import_result', $result);
    }

    public function updateFromJson(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, ['json', 'zip'], true)) {
            return back()->withErrors(['file' => 'Le fichier sélectionné doit être un fichier JSON ou ZIP.']);
        }

        $allowedMimeTypes = ['application/json', 'text/json', 'text/plain', 'application/octet-stream'];
        if ($extension === 'json' && ! in_array($file->getMimeType(), $allowedMimeTypes, true)) {
            return back()->withErrors(['file' => 'Le type du fichier JSON n’est pas accepté.']);
        }

        $contents = file_get_contents($file->getRealPath());

        try {
            $result = $extension === 'zip'
                ? $this->trainingPackageImporter->import($file->getRealPath(), 'update', $file->getClientOriginalName())
                : $this->trainingJsonUpdateApplier->apply($contents === false ? '' : $contents, $file->getClientOriginalName());
        } catch (\DomainException|\InvalidArgumentException $exception) {
            return back()->withErrors(['file' => $exception->getMessage()]);
        } catch (\Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Throwable) {
            return back()->withErrors([
                'file' => 'La mise à jour a échoué. Aucune donnée n’a été modifiée.',
            ]);
        }

        return redirect()->route('trainings.import-export')
            ->with('success', 'Formation mise à jour avec succès.')
            ->with('training_update_result', $result);
    }

    public function index(Request $request)
    {
        $query = Training::query()
            ->when(
                $request->search,
                fn ($q, $search) => $q->where('title', 'like', "%{$search}%")
            )
            ->when($request->date, function ($q, $date) {
                switch ($date) {
                    case 'upcoming':
                        return $q->where('start_date', '>', now());
                    case 'past':
                        return $q->where('end_date', '<', now());
                    case 'ongoing':
                        return $q->where('start_date', '<=', now())
                            ->where('end_date', '>=', now());
                }
            })
            ->latest();

        return inertia('backend/trainings/index', [
            'trainings' => $query->paginate(12),
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:0',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
            'meeting_link' => 'nullable|string',
        ]);

        $isFeatured = (bool) ($validated['is_featured'] ?? false);
        $isPublished = (bool) ($validated['is_published'] ?? false);

        if ($isFeatured) {
            Training::where('is_featured', true)->update(['is_featured' => false]);
        }

        // 0 or empty means no participant limit.
        if (empty($validated['max_participants']) || (int) $validated['max_participants'] <= 0) {
            $validated['max_participants'] = null;
        }

        DB::beginTransaction();
        try {
            $startDate = Carbon::parse($validated['start_date'])->setTimezone(config('app.timezone'));
            $endDate = Carbon::parse($validated['end_date'])->setTimezone(config('app.timezone'));

            $validated['start_date'] = $startDate;
            $validated['end_date'] = $endDate;
            $training = Training::create([
                ...$validated,
                'is_featured' => $isFeatured,
                'is_published' => $isPublished,
                'user_id' => Auth::id(),
                'slug' => rand(1000, 9999).'-'.Str::slug($request->title),
                'published_at' => $isPublished ? now() : null,
                'featured_image' => null,
            ]);

            if ($request->hasFile('featured_image')) {
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'trainings',
                    $this->imageService->generateImageVersions()
                );
                $training->update(['featured_image' => $images]);
            }

            DB::commit();

            return redirect()->route('trainings.show', $training->slug)->with('success', 'Training créée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', 'Erreur lors de la création de la formation: '.$e->getMessage());
        }
    }

    public function update(Request $request, Training $training)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:0',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
            'meeting_link' => 'nullable|string',

        ]);

        $isFeatured = (bool) ($validated['is_featured'] ?? false);
        $isPublished = (bool) ($validated['is_published'] ?? false);

        if ($isFeatured) {
            Training::where('is_featured', true)->update(['is_featured' => false]);
        }

        if (empty($validated['max_participants']) || (int) $validated['max_participants'] <= 0) {
            $validated['max_participants'] = null;
        }

        DB::beginTransaction();
        try {
            if ($request->hasFile('featured_image')) {
                if ($training->featured_image) {
                    $this->imageService->deleteImages($training->featured_image);
                }
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'trainings',
                    $this->imageService->generateImageVersions()
                );
                $validated['featured_image'] = $images;
            } else {
                unset($validated['featured_image']);
            }
            $startDate = Carbon::parse($validated['start_date'])->setTimezone(config('app.timezone'));
            $endDate = Carbon::parse($validated['end_date'])->setTimezone(config('app.timezone'));

            $validated['start_date'] = $startDate;
            $validated['end_date'] = $endDate;
            $training->update([
                ...$validated,
                'is_featured' => $isFeatured,
                'is_published' => $isPublished,
                'published_at' => $isPublished ? now() : null,
            ]);

            DB::commit();

            return redirect()->route('trainings.index')->with('success', 'Training mise à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erreur lors de la mise à jour de la formation');
        }
    }

    public function destroy(Training $training)
    {
        DB::beginTransaction();
        try {
            if ($training->featured_image) {
                $this->imageService->deleteImages($training->featured_image);
            }

            $training->participants()->delete();
            $training->delete();

            DB::commit();

            return redirect()->route('trainings.index')->with('success', 'Training supprimée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erreur lors de la suppression de la formation');
        }
    }

    public function create()
    {
        return inertia('backend/trainings/create');
    }

    public function edit(Training $training)
    {
        return inertia('backend/trainings/edit', [
            'training' => $training->load('participants'),
        ]);
    }

    public function show($slug)
    {
        $training = Training::with(['participants' => function ($query) {
            $query->where('status', '!=', 'cancelled')
                ->select('id', 'training_id', 'name', 'status', 'qty', 'created_at');
        }])->where('slug', $slug)->firstOrFail();

        $training->participant_count = $training->participants->sum('qty');
        $training->is_full = $training->max_participants !== null && $training->participant_count >= $training->max_participants;

        return inertia('backend/trainings/show', [
            'training' => $training,
            'canRegister' => ! $training->is_full && $training->is_published && new DateTime($training->end_date) > new DateTime,
        ]);
    }

    public function participants($slug)
    {
        $training = Training::with(['participants' => function ($query) {
            $query->with(['user'])
                ->orderBy('created_at', 'desc');
        }])->where('slug', $slug)->firstOrFail();

        $participants = $training->participants()
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('reference', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($participant) {
                return [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'email' => $participant->email,
                    'phone' => $participant->phone,
                    'reference' => $participant->reference,
                    'qty' => $participant->qty,
                    'status' => $participant->status,
                    'created_at' => $participant->created_at,
                    'payment_date' => $participant->payment_date,
                    'payment_amount' => $participant->payment_amount,
                ];
            });

        $training->participant_count = $training->participants->sum('qty');

        return inertia('backend/trainings/participants', [
            'training' => $training,
            'participants' => $participants->items(),
            'meta' => [
                'total' => $participants->total(),
                'per_page' => $participants->perPage(),
                'current_page' => $participants->currentPage(),
                'last_page' => $participants->lastPage(),
                'from' => $participants->firstItem(),
                'to' => $participants->lastItem(),
                'links' => $participants->linkCollection()->toArray(),
            ],
        ]);
    }

    public function exportParticipantsCsv($slug)
    {
        $training = Training::where('slug', $slug)->firstOrFail();

        $participants = $training->participants()
            ->orderBy('created_at', 'desc')
            ->get([
                'name',
                'email',
                'phone',
                'reference',
                'qty',
                'status',
                'payment_amount',
                'payment_date',
                'created_at',
            ]);

        $filename = 'participants_formation_'.$training->slug.'_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($participants) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Nom',
                'Email',
                'Telephone',
                'Reference',
                'Places',
                'Statut',
                'Montant paiement',
                'Date paiement',
                'Date inscription',
            ], ';');

            foreach ($participants as $participant) {
                fputcsv($handle, [
                    $participant->name,
                    $participant->email,
                    $participant->phone,
                    $participant->reference,
                    $participant->qty,
                    $participant->status,
                    $participant->payment_amount,
                    optional($participant->payment_date)->format('Y-m-d H:i:s'),
                    optional($participant->created_at)->format('Y-m-d H:i:s'),
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function downloadInvoice($slug, $reference)
    {
        $training = Training::where('slug', $slug)->firstOrFail();
        $registration = TrainingParticipant::where('reference', $reference)
            ->where('training_id', $training->id)
            ->where('status', 'completed')
            ->firstOrFail();

        $data = [
            'training' => $training,
            'registration' => $registration,
            'subtotal' => $training->price * $registration->qty,
            'serviceFee' => $training->price * $registration->qty * 0.05,
            'total' => $training->price * $registration->qty * 1.05,
            'date' => $registration->payment_date ?? $registration->created_at,
            'invoice_number' => 'FACT-'.date('Y').'-'.str_pad($registration->id, 6, '0', STR_PAD_LEFT),
        ];

        $pdf = Pdf::loadView('pdf.formation', $data);

        return $pdf->download('facture_formation_'.$registration->reference.'_'.date('Y-m-d').'.pdf');
    }

    public function showParticipant($slug, $participantId)
    {
        $training = Training::where('slug', $slug)->firstOrFail();
        $participant = TrainingParticipant::with(['training'])->findOrFail($participantId);

        if ($participant->training_id !== $training->id) {
            abort(404);
        }

        $subtotal = $training->price * $participant->qty;
        $serviceFee = $training->price > 0 ? $subtotal * 0.05 : 0;
        $total = $subtotal + $serviceFee;

        return inertia('backend/trainings/participant-details', [
            'training' => $training,
            'participant' => array_merge($participant->toArray(), [
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'formattedCreatedAt' => $participant->created_at->format('d/m/Y H:i'),
                'formattedPaymentDate' => $participant->payment_date ?
                    (new \DateTime($participant->payment_date))->format('d/m/Y H:i') : null,
                'statusLabel' => $this->getStatusLabel($participant->status),
                'canBeCancelled' => $this->canBeCancelled($participant, $training),
            ]),
        ]);
    }

    public function togglePublish(Request $request, Training $formation)
    {
        $validated = $request->validate([
            'is_published' => ['required', 'boolean'],
        ]);

        $formation->update([
            'is_published' => $validated['is_published'],
        ]);

        return back();
    }

    private function getStatusLabel($status)
    {
        return [
            'pending' => 'En attente',
            'completed' => 'Payé',
            'cancelled' => 'Annulé',
            'in_progress' => 'En cours',
        ][$status] ?? $status;
    }

    private function canBeCancelled($participant, $formation)
    {
        if ($participant->status === 'cancelled') {
            return false;
        }

        $cancellationDeadline = (new \DateTime($formation->start_date))
            ->modify('-24 hours');

        return now() <= $cancellationDeadline;
    }

    public function importSections(Request $request, Training $training)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json,txt', 'max:5120'],
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $sections = $this->legacyTrainingContentJsonAdapter->adapt($json === false ? '' : $json, $training);

        try {
            $counts = DB::transaction(fn () => $this->trainingContentImporter->import($training, $sections));

            return back()->with('success', "✓ {$counts['sections']} module(s) et leurs leçons importés avec succès.");
        } catch (\Exception $e) {
            return back()->withErrors([
                'file' => 'Erreur lors de l\'import: '.$e->getMessage(),
            ]);
        }
    }
}
