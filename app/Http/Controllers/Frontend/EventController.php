<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\EventCollection;
use App\Mail\RegistrationAdminNotificationMail;
use App\Mail\RegistrationConfirmationMail;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventParticipant;
use App\Models\PageContent;
use App\Services\DynamicMailerService;
use App\Services\EventCancellationService;
use App\Services\EventTicketService;
use App\Services\OwnedResourceAccessService;
use App\Services\PaymentAmountService;
use App\Services\SeoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                'general' => 'Cet événement est déjà terminé.',
            ]);
        }

        // Ajouter les attributs calculés
        $event->append(['available_seats', 'is_full']);

        // Vérifier si l'événement est complet
        if ($event->is_full) {
            return back()->withErrors([
                'general' => 'Désolé, cet événement est complet.',
            ]);
        }

        // Valider les données du formulaire
        $maxTickets = $event->max_participants === null ? 10 : min($event->available_seats, 10);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'qty' => "required|integer|min:1|max:{$maxTickets}",
        ]);

        $normalizedEmail = mb_strtolower(trim($validated['email']));

        try {
            // Utiliser une transaction pour éviter les problèmes de concurrence
            DB::beginTransaction();

            // Vérifier à nouveau la disponibilité (protection contre les soumissions simultanées)
            $freshEvent = Event::where('slug', $slug)->lockForUpdate()->firstOrFail();
            $freshEvent->append(['available_seats']);

            $existingRegistration = $freshEvent->participants()
                ->active()
                ->where(function ($query) use ($normalizedEmail) {
                    $query->whereRaw('LOWER(email) = ?', [$normalizedEmail]);

                    if (auth()->check()) {
                        $query->orWhere('user_id', auth()->id());
                    }
                })
                ->exists();

            if ($existingRegistration) {
                DB::rollBack();

                return back()->withErrors([
                    'general' => 'Vous êtes déjà inscrit à cet événement.',
                ]);
            }

            if ($validated['qty'] > $freshEvent->available_seats && $freshEvent->max_participants !== null) {
                DB::rollBack();

                return back()->withErrors([
                    'qty' => "Il ne reste que {$freshEvent->available_seats} place(s) disponible(s).",
                ]);
            }

            // Créer l'inscription
            $participant = new EventParticipant([
                'user_id' => auth()->id(),
                'name' => trim($validated['first_name'].' '.$validated['last_name']),
                'email' => $normalizedEmail,
                'phone' => $validated['phone'],
                'qty' => $validated['qty'],
                'status' => (float) $freshEvent->price <= 0
                    ? EventParticipant::STATUS_COMPLETED
                    : EventParticipant::STATUS_PENDING,
                'reference' => EventParticipant::generateReference(),
            ]);

            $freshEvent->participants()->save($participant);

            // Si l'utilisateur n'est pas connecté, stocker l'ID du participant en session
            if (! auth()->check()) {
                session()->put('temp_participant_'.$participant->id, true);
            }

            DB::commit();

            // Si l'événement est gratuit, finaliser directement l'inscription
            if ($event->price <= 0) {
                // Envoyer un email de confirmation
                $this->sendConfirmationEmails($event, $participant);

                return redirect()->route('events.registration.confirmation', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id,
                ]);
            }

            // Sinon, rediriger vers la page de paiement Stripe
            return redirect()->route('events.payment', [
                'slug' => $event->slug,
                'participant_id' => $participant->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log l'erreur pour l'administrateur
            logger()->error('Erreur lors de l\'inscription:', [
                'message' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => auth()->id(),
                'data' => $validated,
            ]);

            return back()->withErrors([
                'general' => "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.",
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
        $participant = EventParticipant::with('event')->findOrFail($participant_id);

        // Vérifier que le participant appartient bien à cet événement
        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        app(OwnedResourceAccessService::class)->authorize($participant);

        // Préparer les données pour la vue
        $participant->load('event');

        return inertia('Frontend/events/registration-confirmation', [
            'event' => $event,
            'registration' => $participant,
            'confirmation' => $this->eventConfirmationData($event, $participant),
        ]);
    }

    private function eventConfirmationData(Event $event, EventParticipant $participant): array
    {
        $isFree = (float) $event->price <= 0;
        $isCancelled = $participant->status === EventParticipant::STATUS_CANCELLED;
        $isConfirmed = $participant->status === EventParticipant::STATUS_COMPLETED
            && ($isFree || $participant->payment_confirmed);
        $canResumePayment = ! $isFree
            && ! $participant->payment_confirmed
            && $participant->status === EventParticipant::STATUS_PENDING;
        $canCancel = ! $isCancelled
            && now()->lte($event->start_date->copy()->subDay())
            && ! $participant->refund_id;

        $state = match (true) {
            $isConfirmed => 'confirmed',
            $isCancelled => 'cancelled',
            $participant->status === EventParticipant::STATUS_IN_PROGRESS => 'payment_processing',
            $canResumePayment => 'awaiting_payment',
            default => 'not_confirmed',
        };

        $title = match ($state) {
            'confirmed' => 'Inscription confirmée',
            'cancelled' => 'Inscription annulée',
            'payment_processing' => 'Paiement en cours de vérification',
            'awaiting_payment' => 'Paiement requis',
            default => 'Inscription non confirmée',
        };

        $message = match ($state) {
            'confirmed' => "Votre inscription est confirmée. Un récapitulatif a été envoyé à {$participant->email}.",
            'cancelled' => 'Cette inscription a été annulée.',
            'payment_processing' => 'Stripe vérifie actuellement votre paiement. Actualisez cette page dans quelques instants.',
            'awaiting_payment' => 'Finalisez le paiement pour confirmer votre inscription.',
            default => 'Cette inscription ne peut pas encore être confirmée.',
        };

        $amounts = $isFree
            ? ['subtotal' => 0, 'serviceFee' => 0, 'total' => 0]
            : app(PaymentAmountService::class)->calculate($event->price * $participant->qty);

        return [
            'state' => $state,
            'title' => $title,
            'message' => $message,
            'is_confirmed' => $isConfirmed,
            'is_free' => $isFree,
            'can_show_calendar' => $isConfirmed,
            'can_cancel' => $canCancel,
            'can_download_invoice' => ! $isFree && $isConfirmed && $participant->payment_confirmed,
            'invoice_url' => ! $isFree && $isConfirmed && $participant->payment_confirmed
                ? route('evenements.facture.download', [
                    'slug' => $event->slug,
                    'reference' => $participant->reference,
                ])
                : null,
            'can_resume_payment' => $canResumePayment,
            'resume_payment_url' => $canResumePayment
                ? route('events.payment', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id,
                ])
                : null,
            'ticket_url' => app(EventTicketService::class)->signedUrl($event, $participant),
            'amounts' => $amounts,
        ];
    }

    /**
     * Annuler une inscription
     */
    public function cancelRegistration(Request $request, $slug, $participant_id)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $participant = EventParticipant::findOrFail($participant_id);

        if ((int) $participant->event_id !== (int) $event->id) {
            abort(404);
        }

        app(OwnedResourceAccessService::class)->authorize($participant, 'update');

        try {
            app(EventCancellationService::class)->cancel(
                $event,
                $participant,
                (bool) auth()->user()?->can('administer')
            );

            return redirect()->route('evenements.details', $slug)
                ->with('success', 'Votre inscription a été annulée. Le remboursement éventuel a été demandé à Stripe.');
        } catch (\Illuminate\Validation\ValidationException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            Log::error('Échec sécurisé de l’annulation événement.', [
                'event_id' => $event->id,
                'participant_id' => $participant->id,
                'message' => $exception->getMessage(),
            ]);

            return back()->withErrors([
                'general' => 'L’inscription n’a pas été annulée car le remboursement n’a pas pu être confirmé. Veuillez réessayer ou contacter le support.',
            ]);
        }
    }

    /**
     * Ancienne implémentation conservée temporairement hors routage.
     */
    private function cancelRegistrationLegacy(Request $request, $slug, $participant_id)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $participant = EventParticipant::findOrFail($participant_id);

        // Vérifier que le participant appartient bien à cet événement
        if ($participant->event_id !== $event->id) {
            abort(404);
        }

        app(OwnedResourceAccessService::class)->authorize($participant, 'update');

        // Vérifier si l'annulation est encore possible
        $cancellationDeadline = (new \DateTime($event->start_date))->modify('-24 hours');
        if (now() > $cancellationDeadline && ! auth()->user()?->can('administer')) {
            return back()->withErrors([
                'general' => "Les annulations ne sont plus possibles moins de 24h avant le début de l'événement.",
            ]);
        }

        try {
            DB::beginTransaction();

            // Mettre à jour le statut
            $previousStatus = $participant->status;
            $participant->update([
                'status' => EventParticipant::STATUS_CANCELLED,
                'cancelled_at' => now(),
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
                'participant_id' => $participant->id,
            ]);

            return back()->withErrors([
                'general' => "Une erreur s'est produite lors de l'annulation. Veuillez réessayer.",
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

        app(OwnedResourceAccessService::class)->authorize($registration);

        $amounts = app(PaymentAmountService::class)->calculate($event->price * $registration->qty);

        // Générer la facture
        $data = [
            'event' => $event,
            'registration' => $registration,
            ...$amounts,
            'date' => $registration->payment_date ?? $registration->created_at,
            'invoice_number' => 'FACT-'.date('Y').'-'.str_pad($registration->id, 6, '0', STR_PAD_LEFT),
        ];

        // Générer le PDF
        $pdf = Pdf::loadView('pdf.event', $data);

        // Options supplémentaires pour le PDF
        $pdf->setPaper('a4');
        $pdf->setWarnings(false);

        // Télécharger avec un nom de fichier formaté
        return $pdf->download('facture_'.$registration->reference.'_'.date('Y-m-d').'.pdf');
    }
}
