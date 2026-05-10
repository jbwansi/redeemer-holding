<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\ImageService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EventController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index(Request $request)
    {
        $query = Event::with('category')
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('title', 'like', "%{$search}%")
            )
            ->when(
                $request->category,
                fn($q, $category) =>
                $q->where('category_id', $category)
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

        return inertia('backend/events/index', [
            'events' => $query->paginate(12),
            'categories' => Category::orderBy('name')->get(),
            'filters' => $request->only(['search', 'category', 'date'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:0',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
        ]);

        $isFeatured = (bool) ($validated['is_featured'] ?? false);
        $isPublished = (bool) ($validated['is_published'] ?? false);

        if ($isFeatured) {
            Event::where('is_featured', true)->update(['is_featured' => false]);
        }

        if (empty($validated['max_participants']) || (int) $validated['max_participants'] <= 0) {
            $validated['max_participants'] = null;
        }

        DB::beginTransaction();
        try {
            $creatorId = Auth::id() ?? User::query()->value('id');

            if (!$creatorId) {
                throw new \RuntimeException("Aucun utilisateur disponible pour associer l'événement. Créez un compte admin puis réessayez.");
            }

            $startDate = Carbon::parse($validated['start_date'])->setTimezone(config('app.timezone'));
            $endDate = Carbon::parse($validated['end_date'])->setTimezone(config('app.timezone'));

            $validated['start_date'] = $startDate;
            $validated['end_date'] = $endDate;
            $this->ensureEventCategoryMirror((int) $validated['category_id']);

            $event = Event::create([
                ...$validated,
                'is_featured' => $isFeatured,
                'is_published' => $isPublished,
                'user_id' => $creatorId,
                'slug' => rand(1000, 9999) . '-' . Str::slug($request->title),
                'published_at' => $isPublished ? now() : null,
                "featured_image" => null
            ]);


            if ($request->hasFile('featured_image')) {
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'events',
                    $this->imageService->generateImageVersions()
                );
                $event->update(['featured_image' => $images]);
            }

            DB::commit();
            return redirect()->route('events.show', $event->slug)->with('success', 'Événement créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Erreur lors de la création de l\'événement : ' . $e->getMessage());
        }
    }

    public function update(Request $request, Event $event)
    {

        // dd($request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:0',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
        ]);

        $isFeatured = (bool) ($validated['is_featured'] ?? false);
        $isPublished = (bool) ($validated['is_published'] ?? false);

        // si le is_featured est true, on met les autres events en false
        if ($isFeatured) {
            Event::where('is_featured', true)->update(['is_featured' => false]);
        }

        if (empty($validated['max_participants']) || (int) $validated['max_participants'] <= 0) {
            $validated['max_participants'] = null;
        }

        DB::beginTransaction();
        try {
            if ($request->hasFile('featured_image')) {
                if ($event->featured_image) {
                    $this->imageService->deleteImages($event->featured_image);
                }
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'events',
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
            $this->ensureEventCategoryMirror((int) $validated['category_id']);

            $event->update([
                ...$validated,
                'is_featured' => $isFeatured,
                'is_published' => $isPublished,
                'published_at' => $isPublished ? now() : null,
            ]);

            DB::commit();
            return redirect()->route('events.index')->with('success', 'Événement mis à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la mise à jour de l\'événement');
        }
    }

    public function destroy(Event $event)
    {
        DB::beginTransaction();
        try {
            if ($event->featured_image) {
                $this->imageService->deleteImages($event->featured_image);
            }

            $event->participants()->delete();
            $event->delete();

            DB::commit();
            return redirect()->route('events.index')->with('success', 'Événement supprimé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la suppression de l\'événement');
        }
    }

    public function create()
    {
        return inertia('backend/events/create', [
            'categories' => Category::orderBy('name')->get()
        ]);
    }

    public function edit(Event $event)
    {
        return inertia('backend/events/edit', [
            'event' => $event,
            'categories' => Category::orderBy('name')->get()
        ]);
    }
    public function show($slug)
    {
        $event = Event::with([
            'category',
            'participants' => function ($query) {
                $query->where('status', '!=', 'cancelled')
                    ->select('id', 'event_id', 'name', 'status', 'qty', 'created_at');
            }
        ])->where('slug', $slug)->firstOrFail();

        // Ajouter l'information pour déterminer quel bouton afficher
        $event->participant_count = $event->participants->sum('qty');
        $event->is_full = $event->max_participants !== null && $event->participant_count >= $event->max_participants;

        return inertia('backend/events/show', [
            'event' => $event,
            'canRegister' => !$event->is_full && $event->is_published && new DateTime($event->end_date) > new DateTime(),
        ]);
    }

    public function participants($slug)
    {
        $event = Event::with([
            'participants' => function ($query) {
                $query->with(['user'])
                    ->orderBy('created_at', 'desc');
            }
        ])->where('slug', $slug)->firstOrFail();

        $participants = $event->participants()
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

        $event->participant_count = $event->participants->sum('qty');

        return inertia('backend/events/participants', [
            'event' => $event,
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
        $event = Event::where('slug', $slug)->firstOrFail();

        $participants = $event->participants()
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

        $filename = 'participants_evenement_' . $event->slug . '_' . now()->format('Ymd_His') . '.csv';

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

    /**
     * Télécharger la facture d'un participant
     */
    public function downloadInvoice($slug, $reference)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $registration = EventParticipant::where('reference', $reference)
            ->where('event_id', $event->id)
            ->where('status', 'completed')
            ->firstOrFail();

        // Préparer les données pour la facture
        $data = [
            'event' => $event,
            'registration' => $registration,
            'subtotal' => $event->price * $registration->qty,
            'serviceFee' => $event->price * $registration->qty * 0.05,
            'total' => $event->price * $registration->qty * 1.05,
            'date' => $registration->payment_date ?? $registration->created_at,
            'invoice_number' => 'FACT-' . date('Y') . '-' . str_pad($registration->id, 6, '0', STR_PAD_LEFT)
        ];

        // Générer le PDF
        $pdf = Pdf::loadView('pdf.event', $data);

        // Télécharger avec un nom formaté
        return $pdf->download('facture_' . $registration->reference . '_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Afficher les détails d'un participant
     */
    public function showParticipant($slug, $participantId)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $participant = EventParticipant::with(['event'])->findOrFail($participantId);

        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        // Calculer les montants
        $subtotal = $event->price * $participant->qty;
        $serviceFee = $event->price > 0 ? $subtotal * 0.05 : 0;
        $total = $subtotal + $serviceFee;

        return inertia('backend/events/participant-details', [
            'event' => $event,
            'participant' => array_merge($participant->toArray(), [
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'formattedCreatedAt' => $participant->created_at->format('d/m/Y H:i'),
                'formattedPaymentDate' => $participant->payment_date ?
                    (new \DateTime($participant->payment_date))->format('d/m/Y H:i') : null,
                'statusLabel' => $this->getStatusLabel($participant->status),
                'canBeCancelled' => $this->canBeCancelled($participant, $event),
            ])
        ]);
    }

    public function togglePublish(Request $request, Event $event)
    {
        $validated = $request->validate([
            'is_published' => ['required', 'boolean'],
        ]);

        $event->update([
            'is_published' => $validated['is_published'],
        ]);

        return back();
    }

    /**
     * Obtenir le libellé du statut
     */
    private function getStatusLabel($status)
    {
        return [
            'pending' => 'En attente',
            'completed' => 'Payé',
            'cancelled' => 'Annulé',
            'in_progress' => 'En cours'
        ][$status] ?? $status;
    }

    /**
     * Vérifier si l'inscription peut être annulée
     */
    private function canBeCancelled($participant, $event)
    {
        if ($participant->status === 'cancelled') {
            return false;
        }

        $cancellationDeadline = (new \DateTime($event->start_date))
            ->modify('-24 hours');

        return now() <= $cancellationDeadline;
    }

    private function ensureEventCategoryMirror(int $categoryId): void
    {
        $category = Category::findOrFail($categoryId);

        $eventCategory = EventCategory::withTrashed()->firstOrNew(['id' => $category->id]);
        $eventCategory->name = $category->name;
        $eventCategory->slug = $category->slug;
        $eventCategory->description = $eventCategory->description ?? null;
        $eventCategory->color = $eventCategory->color ?? '#000000';
        $eventCategory->save();

        if ($eventCategory->trashed()) {
            $eventCategory->restore();
        }
    }
}
