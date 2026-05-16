<?php


namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\EventCollection;
// use App\Mail\AdminEventNotificationMail;
// use App\Mail\EventConfirmationMail;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventParticipant;
use App\Models\PageContent;
use App\Services\DynamicMailerService;
use App\Services\SeoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Mail\RegistrationConfirmationMail;
use App\Mail\RegistrationAdminNotificationMail;

class EventController extends Controller
{


    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }


    // --- Services et constructeurs ---

    public function events(Request $request)
    {
        $events = new EventCollection(
            Event::with(['category'])
                ->published()
                ->latest()
                ->paginate(9)
                ->appends($request->query())
        );

        $categories = EventCategory::orderBy('name')
            ->withCount('events')
            ->get();

        $featuredEvent = Event::with(['category'])
            ->where('is_featured', true)
            ->published()
            ->first();

        // 🔥 AJOUT ICI
        $pageContent = PageContent::where('page', 'events')
            ->pluck('value', 'key');

        return inertia('Frontend/events/index', [
            'events' => $events,
            'categories' => $categories,
            'featuredEvent' => $featuredEvent,
            'pageContent' => $pageContent, // 🔥 AJOUT
            'seo' => SeoService::page(
                'Événements',
                'Découvrez nos prochains événements de coaching et de développement personnel.'
            ),
        ]);
    }

    public function evenement_detail($slug)
    {
        $event = Event::with(['category'])->published()->where('slug', $slug)->firstOrFail();
        $event->incrementViews();
        $eventImage = SeoService::firstImageUrl($event->featured_image ?? []);
        return inertia('Frontend/events/show', [
            'event' => $event,
            'seo' => SeoService::event(
                $event->title ?? $event->name ?? '',
                $event->description ?? $event->excerpt ?? '',
                $eventImage,
                optional($event->start_date)->toIso8601String() ?? '',
                $event->location ?? null,
            ),
        ]);
    }

    /**
     * Traiter l'inscription à un événement
     */
    public function register(Request $request, $slug)
    {
        // Récupérer l'événement
        $event = Event::where('slug', $slug)
            ->published()
            ->firstOrFail();

        // Vérifier si l'événement est à venir
        if (now() > $event->end_date) {
            return back()->withErrors([
                'general' => "Cet événement est déjà terminé."
            ]);
        }

        // Ajouter les attributs calculés
        $event->append(['available_seats', 'is_full']);

        // Vérifier si l'événement est complet
        if ($event->is_full) {
            return back()->withErrors([
                'general' => "Désolé, cet événement est complet."
            ]);
        }

        // Valider les données du formulaire
        $maxTickets = $event->max_participants === null ? 10 : min($event->available_seats, 10);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'qty' => "required|integer|min:1|max:{$maxTickets}"
        ]);

        try {
            // Utiliser une transaction pour éviter les problèmes de concurrence
            DB::beginTransaction();

            // Vérifier à nouveau la disponibilité (protection contre les soumissions simultanées)
            $freshEvent = Event::where('slug', $slug)->firstOrFail();
            $freshEvent->append(['available_seats']);

            if ($validated['qty'] > $freshEvent->available_seats && $freshEvent->max_participants !== null) {
                DB::rollBack();
                return back()->withErrors([
                    'qty' => "Il ne reste que {$freshEvent->available_seats} place(s) disponible(s)."
                ]);
            }

            // Créer l'inscription
            $reference = strtoupper(Str::random(8));
            $participant = new EventParticipant([
                'user_id' => auth()->id(),
                'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'qty' => $validated['qty'],
                'status' => EventParticipant::STATUS_PENDING,
                'reference' => $reference
            ]);

            $event->participants()->save($participant);

            // Si l'utilisateur n'est pas connecté, stocker l'ID du participant en session
            if (!auth()->check()) {
                session()->put('temp_participant_' . $participant->id, true);
            }

            DB::commit();

            // Si l'événement est gratuit, finaliser directement l'inscription
            if ($event->price <= 0) {
                $participant->update([
                    'status' => EventParticipant::STATUS_COMPLETED
                ]);

                // Envoyer un email de confirmation
                $this->sendConfirmationEmails($event, $participant);
                return redirect()->route('events.registration.confirmation', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id
                ]);
            }
            // Sinon, rediriger vers la page de paiement Stripe
            return redirect()->route('events.payment', [
                'slug' => $event->slug,
                'participant_id' => $participant->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log l'erreur pour l'administrateur
            logger()->error('Erreur lors de l\'inscription:', [
                'message' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => auth()->id(),
                'data' => $validated
            ]);

            return back()->withErrors([
                'general' => "Une erreur s'est produite lors de l'inscription. Veuillez réessayer."
            ]);
        }
    }
   private function sendConfirmationEmails(Event $event, EventParticipant $participant)
{
    try {
        if ((bool) get_setting('event_confirmation_enabled', true)) {
            $this->dynamicMailerService->queue(
                new RegistrationConfirmationMail(
                    type: 'event',
                    item: $event,
                    participant: $participant,
                ),
                $participant->email
            );
        }

        $adminEmail = get_setting('support_email');

        if ($adminEmail) {
            $this->dynamicMailerService->queue(
                new RegistrationAdminNotificationMail(
                    type: 'event',
                    item: $event,
                    participant: $participant,
                ),
                $adminEmail
            );
        }

        Log::info('Emails événement envoyés avec succès', [
            'participant' => $participant->email,
            'admin' => $adminEmail,
        ]);
    } catch (\Exception $e) {
        Log::error('Erreur envoi emails événement', [
            'message' => $e->getMessage(),
            'participant_email' => $participant->email,
        ]);
    }
}

    /**
     * Afficher la page de confirmation d'inscription
     */
    public function showConfirmation($slug, $participant_id)
    {
        $event = Event::where('slug', $slug)->published()->firstOrFail();
        $participant = EventParticipant::findOrFail($participant_id);

        // Vérifier que le participant appartient bien à cet événement
        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        // Vérifier les autorisations
        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
        }

        // Préparer les données pour la vue
        $participant->load('event');

        return inertia('Frontend/events/registration-confirmation', [
            'event' => $event,
            'registration' => $participant,
            'total' => $event->price * $participant->qty
        ]);
    }

    /**
     * Annuler une inscription
     */
    public function cancelRegistration(Request $request, $slug, $participant_id)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $participant = EventParticipant::findOrFail($participant_id);

        // Vérifier que le participant appartient bien à cet événement
        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        // Vérifier les autorisations
        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à effectuer cette action.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à effectuer cette action.");
        }

        // Vérifier si l'annulation est encore possible
        $cancellationDeadline = (new \DateTime($event->start_date))->modify('-24 hours');
        if (now() > $cancellationDeadline && !auth()->user()?->hasRole('admin')) {
            return back()->withErrors([
                'general' => "Les annulations ne sont plus possibles moins de 24h avant le début de l'événement."
            ]);
        }

        try {
            DB::beginTransaction();

            // Mettre à jour le statut
            $previousStatus = $participant->status;
            $participant->update([
                'status' => EventParticipant::STATUS_CANCELLED,
                'cancelled_at' => now()
            ]);

            // Si le participant avait payé, traiter le remboursement si applicable
            if ($previousStatus === EventParticipant::STATUS_COMPLETED && $event->price > 0 && $participant->payment_id) {
                // Logique de remboursement via Stripe
                // ... appel au service de remboursement
            }

            DB::commit();

            // Envoyer un email de confirmation d'annulation
            // ... logique d'envoi d'email

            return redirect()->route('evenements.details', $slug)
                ->with('success', 'Votre inscription a été annulée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();

            logger()->error('Erreur lors de l\'annulation:', [
                'message' => $e->getMessage(),
                'event_id' => $event->id,
                'participant_id' => $participant->id
            ]);

            return back()->withErrors([
                'general' => "Une erreur s'est produite lors de l'annulation. Veuillez réessayer."
            ]);
        }
    }

    /**
     * Télécharger la facture
     */
    public function downloadInvoice($slug, $reference)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $registration = EventParticipant::where('reference', $reference)
            ->where('event_id', $event->id)
            ->where('status', 'completed')  // S'assurer que l'inscription est payée
            ->firstOrFail();

        // Vérifier que c'est un événement payant
        if ($event->price <= 0) {
            abort(404);
        }

        // Vérifier les autorisations
        if (auth()->check()) {
            if ($registration->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403);
            }
        } elseif (!session()->has('temp_participant_' . $registration->id)) {
            abort(403);
        }

        // Générer la facture
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

        // Options supplémentaires pour le PDF
        $pdf->setPaper('a4');
        $pdf->setWarnings(false);

        // Télécharger avec un nom de fichier formaté
        return $pdf->download('facture_' . $registration->reference . '_' . date('Y-m-d') . '.pdf');
    }

}
