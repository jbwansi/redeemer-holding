<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingSection;
use App\Models\TrainingLesson;
use App\Models\TrainingResource;
use App\Services\ImageService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TrainingController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index(Request $request)
    {
        $query = Training::query()
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('title', 'like', "%{$search}%")
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
            'filters' => $request->only(['search', 'date'])
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
                'slug' => rand(1000, 9999) . '-' . Str::slug($request->title),
                'published_at' => $isPublished ? now() : null,
                'featured_image' => null
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
            return back()->withInput()->with('error', 'Erreur lors de la création de la formation: ' . $e->getMessage());
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
            'training' => $training->load('participants')
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
            'canRegister' => !$training->is_full && $training->is_published && new DateTime($training->end_date) > new DateTime(),
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
                'links' => $participants->linkCollection()->toArray()
            ]
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

        $filename = 'participants_formation_' . $training->slug . '_' . now()->format('Ymd_His') . '.csv';

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
            'invoice_number' => 'FACT-' . date('Y') . '-' . str_pad($registration->id, 6, '0', STR_PAD_LEFT)
        ];

        $pdf = Pdf::loadView('pdf.formation', $data);

        return $pdf->download('facture_formation_' . $registration->reference . '_' . date('Y-m-d') . '.pdf');
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
            ])
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
            'in_progress' => 'En cours'
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

    public function importJson(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json,txt'],
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($json, true);

        if (!$data) {
            return back()->withErrors([
                'file' => 'Le fichier JSON est invalide.',
            ]);
        }

        // Validate required fields
        if (empty($data['title'])) {
            return back()->withErrors([
                'file' => 'Le JSON doit contenir une clé "title" pour la formation.',
            ]);
        }

        try {
            DB::transaction(function () use ($data) {
                $training = Training::updateOrCreate(
                    ['slug' => Str::slug($data['title'])],
                    [
                        'title' => $data['title'],
                        'excerpt' => $data['excerpt'] ?? null,
                        'is_published' => (bool) ($data['is_published'] ?? false),
                    ]
                );

                $sectionIndex = 0;
                foreach ($data['sections'] ?? [] as $sectionData) {
                    if (empty($sectionData['title'])) {
                        continue;
                    }

                    $section = TrainingSection::updateOrCreate(
                        [
                            'training_id' => $training->id,
                            'title' => $sectionData['title'],
                        ],
                        [
                            'sort_order' => (int) ($sectionData['sort_order'] ?? ++$sectionIndex),
                        ]
                    );

                    $lessonIndex = 0;
                    foreach ($sectionData['lessons'] ?? [] as $lessonData) {
                        if (empty($lessonData['title'])) {
                            continue;
                        }

                        $videoDuration = $lessonData['video_duration'] ?? null;
                        if ($videoDuration !== null && (!is_numeric($videoDuration) || $videoDuration < 0)) {
                            $videoDuration = null;
                        }

                        $lesson = TrainingLesson::updateOrCreate(
                            [
                                'training_section_id' => $section->id,
                                'title' => $lessonData['title'],
                            ],
                            [
                                'slug' => Str::slug($lessonData['title']),
                                'excerpt' => $lessonData['excerpt'] ?? null,
                                'content' => $lessonData['content'] ?? null,
                                'video_url' => $lessonData['video_url'] ?? null,
                                'video_duration' => $videoDuration,
                                'sort_order' => (int) ($lessonData['sort_order'] ?? ++$lessonIndex),
                                'is_published' => (bool) ($lessonData['is_published'] ?? false),
                                'is_free' => (bool) ($lessonData['is_free'] ?? false),
                                'training_id' => $training->id,
                            ]
                        );

                        $resourceIndex = 0;
                        foreach ($lessonData['resources'] ?? [] as $resourceData) {
                            if (empty($resourceData['title'])) {
                                continue;
                            }

                            TrainingResource::updateOrCreate(
                                [
                                    'training_lesson_id' => $lesson->id,
                                    'title' => $resourceData['title'],
                                ],
                                [
                                    'description' => $resourceData['description'] ?? null,
                                    'external_url' => $resourceData['external_url'] ?? null,
                                    'file_type' => $resourceData['file_type'] ?? 'pdf',
                                    'is_downloadable' => (bool) ($resourceData['is_downloadable'] ?? true),
                                    'is_public' => (bool) ($resourceData['is_public'] ?? false),
                                    'sort_order' => (int) ($resourceData['sort_order'] ?? ++$resourceIndex),
                                ]
                            );
                        }
                    }
                }
            });

            return back()->with('success', '✓ Formation importée avec succès.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'file' => 'Erreur lors de l\'import: ' . $e->getMessage(),
            ]);
        }
    }

    public function importSections(Request $request, Training $training)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json,txt'],
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($json, true);

        if (!$data) {
            return back()->withErrors([
                'file' => 'Le fichier JSON est invalide.',
            ]);
        }

        if (empty($data['sections'])) {
            return back()->withErrors([
                'file' => 'Le JSON doit contenir au minimum une clé "sections" avec un tableau de modules.',
            ]);
        }

        try {
            DB::transaction(function () use ($data, $training) {
                $sectionIndex = $training->sections()->max('sort_order') ?? 0;
                
                foreach ($data['sections'] ?? [] as $sectionData) {
                    if (empty($sectionData['title'])) {
                        continue;
                    }

                    $sectionIndex++;
                    $section = TrainingSection::create([
                        'training_id' => $training->id,
                        'title' => $sectionData['title'],
                        'sort_order' => (int) ($sectionData['sort_order'] ?? $sectionIndex),
                    ]);

                    $lessonIndex = 0;
                    foreach ($sectionData['lessons'] ?? [] as $lessonData) {
                        if (empty($lessonData['title'])) {
                            continue;
                        }

                        $videoDuration = $lessonData['video_duration'] ?? null;
                        if ($videoDuration !== null && (!is_numeric($videoDuration) || $videoDuration < 0)) {
                            $videoDuration = null;
                        }

                        $lesson = TrainingLesson::create([
                            'training_id' => $training->id,
                            'training_section_id' => $section->id,
                            'title' => $lessonData['title'],
                            'slug' => Str::slug($lessonData['title']),
                            'excerpt' => $lessonData['excerpt'] ?? null,
                            'content' => $lessonData['content'] ?? null,
                            'video_url' => $lessonData['video_url'] ?? null,
                            'video_duration' => $videoDuration,
                            'sort_order' => (int) ($lessonData['sort_order'] ?? ++$lessonIndex),
                            'is_published' => (bool) ($lessonData['is_published'] ?? false),
                            'is_free' => (bool) ($lessonData['is_free'] ?? false),
                        ]);

                        $resourceIndex = 0;
                        foreach ($lessonData['resources'] ?? [] as $resourceData) {
                            if (empty($resourceData['title'])) {
                                continue;
                            }

                            TrainingResource::create([
                                'training_lesson_id' => $lesson->id,
                                'title' => $resourceData['title'],
                                'description' => $resourceData['description'] ?? null,
                                'external_url' => $resourceData['external_url'] ?? null,
                                'file_type' => $resourceData['file_type'] ?? 'pdf',
                                'is_downloadable' => (bool) ($resourceData['is_downloadable'] ?? true),
                                'is_public' => (bool) ($resourceData['is_public'] ?? false),
                                'sort_order' => (int) ($resourceData['sort_order'] ?? ++$resourceIndex),
                            ]);
                        }
                    }
                }
            });

            $sectionsCount = $data['sections'] ? count($data['sections']) : 0;
            return back()->with('success', "✓ {$sectionsCount} module(s) et leurs leçons importés avec succès.");
        } catch (\Exception $e) {
            return back()->withErrors([
                'file' => 'Erreur lors de l\'import: ' . $e->getMessage(),
            ]);
        }
    }
}


