<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\FormationParticipant;
use App\Services\ImageService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FormationController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index(Request $request)
    {
        $query = Formation::query()
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
            });

        return inertia('backend/formations/index', [
            'formations' => $query->paginate(12),
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
            'max_participants' => 'nullable|integer|min:1',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
            'meeting_link' => 'nullable|string',
        ]);

        if ($validated['is_featured'] == true) {
            Formation::where('is_featured', true)->update(['is_featured' => false]);
        }

        DB::beginTransaction();
        try {
            $startDate = Carbon::parse($validated['start_date'])->setTimezone(config('app.timezone'));
            $endDate = Carbon::parse($validated['end_date'])->setTimezone(config('app.timezone'));

            $validated['start_date'] = $startDate;
            $validated['end_date'] = $endDate;
            $formation = Formation::create([
                ...$validated,
                'user_id' => Auth::id(),
                'slug' => rand(1000, 9999) . '-' . Str::slug($request->title),
                'published_at' => $request->is_published ? now() : null,
                'featured_image' => null
            ]);

            if ($request->hasFile('featured_image')) {
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'formations',
                    $this->imageService->generateImageVersions()
                );
                $formation->update(['featured_image' => $images]);
            }

            DB::commit();
            return redirect()->route('formations.index')->with('success', 'Formation créée avec succès');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la création de la formation: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Formation $formation)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
            'meeting_link' => 'nullable|string',

        ]);

        if ($validated['is_featured'] == true) {
            Formation::where('is_featured', true)->update(['is_featured' => false]);
        }

        DB::beginTransaction();
        try {
            if ($request->hasFile('featured_image')) {
                if ($formation->featured_image) {
                    $this->imageService->deleteImages($formation->featured_image);
                }
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'formations',
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
            $formation->update([
                ...$validated,
                'published_at' => $request->is_published ? now() : null,
            ]);

            DB::commit();
            return redirect()->route('formations.index')->with('success', 'Formation mise à jour avec succès');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la mise à jour de la formation');
        }
    }

    public function destroy(Formation $formation)
    {
        DB::beginTransaction();
        try {
            if ($formation->featured_image) {
                $this->imageService->deleteImages($formation->featured_image);
            }

            $formation->participants()->delete();
            $formation->delete();

            DB::commit();
            return redirect()->route('formations.index')->with('success', 'Formation supprimée avec succès');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la suppression de la formation');
        }
    }

    public function create()
    {
        return inertia('backend/formations/create');
    }

    public function edit(Formation $formation)
    {
        return inertia('backend/formations/edit', [
            'formation' => $formation
        ]);
    }

    public function show($slug)
    {
        $formation = Formation::with(['participants' => function ($query) {
            $query->where('status', '!=', 'cancelled')
                ->select('id', 'formation_id', 'name', 'status', 'qty', 'created_at');
        }])->where('slug', $slug)->firstOrFail();

        $formation->participant_count = $formation->participants->sum('qty');
        $formation->is_full = $formation->max_participants !== null && $formation->participant_count >= $formation->max_participants;

        return inertia('backend/formations/show', [
            'formation' => $formation,
            'canRegister' => !$formation->is_full && $formation->is_published && new DateTime($formation->end_date) > new DateTime(),
        ]);
    }

    public function participants($slug)
    {
        $formation = Formation::with(['participants' => function ($query) {
            $query->with(['user'])
                ->orderBy('created_at', 'desc');
        }])->where('slug', $slug)->firstOrFail();

        $participants = $formation->participants()
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

        $formation->participant_count = $formation->participants->sum('qty');

        return inertia('backend/formations/participants', [
            'formation' => $formation,
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

    public function downloadInvoice($slug, $reference)
    {
        $formation = Formation::where('slug', $slug)->firstOrFail();
        $registration = FormationParticipant::where('reference', $reference)
            ->where('formation_id', $formation->id)
            ->where('status', 'completed')
            ->firstOrFail();

        $data = [
            'formation' => $formation,
            'registration' => $registration,
            'subtotal' => $formation->price * $registration->qty,
            'serviceFee' => $formation->price * $registration->qty * 0.05,
            'total' => $formation->price * $registration->qty * 1.05,
            'date' => $registration->payment_date ?? $registration->created_at,
            'invoice_number' => 'FACT-' . date('Y') . '-' . str_pad($registration->id, 6, '0', STR_PAD_LEFT)
        ];

        $pdf = Pdf::loadView('pdf.formation', $data);

        return $pdf->download('facture_formation_' . $registration->reference . '_' . date('Y-m-d') . '.pdf');
    }

    public function showParticipant($slug, $participantId)
    {
        $formation = Formation::where('slug', $slug)->firstOrFail();
        $participant = FormationParticipant::with(['formation'])->findOrFail($participantId);

        if ($participant->formation_id !== $formation->id) {
            abort(404);
        }

        $subtotal = $formation->price * $participant->qty;
        $serviceFee = $formation->price > 0 ? $subtotal * 0.05 : 0;
        $total = $subtotal + $serviceFee;

        return inertia('backend/formations/participant-details', [
            'formation' => $formation,
            'participant' => array_merge($participant->toArray(), [
                'subtotal' => $subtotal,
                'serviceFee' => $serviceFee,
                'total' => $total,
                'formattedCreatedAt' => $participant->created_at->format('d/m/Y H:i'),
                'formattedPaymentDate' => $participant->payment_date ?
                    (new \DateTime($participant->payment_date))->format('d/m/Y H:i') : null,
                'statusLabel' => $this->getStatusLabel($participant->status),
                'canBeCancelled' => $this->canBeCancelled($participant, $formation),
            ])
        ]);
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
}
