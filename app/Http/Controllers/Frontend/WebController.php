<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\SeoService;
use App\Http\Resources\Event\EventCollection;
use App\Http\Resources\Event\EventResource;
use App\Http\Resources\Formation\FormationCollection;
use App\Http\Resources\Post\PostCollection;
use App\Http\Resources\Post\PostResource;
use App\Mail\AdminEventNotificationMail;
use App\Mail\EventConfirmationMail;
use App\Mail\FormationRegistrationAdminNotification;
use App\Mail\FormationRegistrationConfirmation;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventParticipant;
use App\Models\Formation;
use App\Models\FormationParticipant;
use App\Models\Post;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\DynamicMailerService;

class WebController extends Controller
{
    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }




    public function blogs(Request $request)
    {
        $postsPaginator = Post::with(['user', 'categories'])
            ->published()
            ->latest()
            ->paginate(9)
            ->appends($request->query());

        $posts = PostResource::collection($postsPaginator);
        $featuredModel = Post::with(['user', 'categories'])->published()->latest()->first();
        $featuredPost = $featuredModel ? PostResource::make($featuredModel) : null;
        $categories = Category::orderBy('name')->withCount('posts')->get();
        //recuperer toutes les tags des posts
        $tags = [];
        foreach ($postsPaginator->items() as $post) {
            foreach ($post->tags ?? [] as $tag) {
                array_push($tags, $tag);
            }
        }

        return inertia('frontend/blogs/index', [
            'tags'         => $tags,
            'posts'        => $posts,
            'categories'   => $categories,
            'featuredPost' => $featuredPost,
            'seo'          => SeoService::page('Blog', 'Articles sur la transformation personnelle, le développement personnel et le coaching.'),
        ]);
    }

    public function blog_detail($slug)
    {
        $blog = PostResource::make(Post::with(['user', 'categories'])->published()->where('slug', $slug)->firstOrFail());
        $relatedPosts = Post::with(['user', 'categories'])->published()->whereHas('categories', function ($query) use ($blog) {
            $query->where('category_id', $blog->categories->first()->id);
        });
        $cacheKey = "viewed_page_{$blog->id}_" . request()->ip();
        if (!Cache::has($cacheKey)) {
            $blog->increment('views');
            Cache::put($cacheKey, true, now()->addHours(1));
        }
        $postModel = $blog->resource;
        $postImage = SeoService::firstImageUrl($postModel->featured_image ?? []);
        return inertia('frontend/blogs/show', [
            'post'         => $blog,
            'relatedPosts' => new PostCollection($relatedPosts->get()),
            'seo'          => SeoService::article(
                $postModel->title ?? $postModel->name ?? '',
                $postModel->excerpt ?? $postModel->description ?? '',
                $postImage,
                optional($postModel->published_at)->toIso8601String() ?? now()->toIso8601String(),
                optional($postModel->user)->name ?? '',
            ),
        ]);
    }


    public function events(Request $request)
    {
        $events = new EventCollection(
            Event::with(['category'])
                ->published()
                ->latest()
                ->paginate(9)
                ->appends($request->query())
        );

        $categories = EventCategory::orderBy('name')->withCount('events')->get();
        $featuredEvent = Event::with(['category'])->where('is_featured', true)->published()->first();
        return inertia('frontend/events/index', [
            'events'        => $events,
            'categories'    => $categories,
            'featuredEvent' => $featuredEvent,
            'seo'           => SeoService::page('Événements', 'Découvrez nos prochains événements de coaching et de développement personnel.'),
        ]);
    }

    public function evenement_detail($slug)
    {
        $event = Event::with(['category'])->published()->where('slug', $slug)->firstOrFail();
        $event->incrementViews();
        $eventImage = SeoService::firstImageUrl($event->featured_image ?? []);
        return inertia('frontend/events/show', [
            'event' => $event,
            'seo'   => SeoService::event(
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
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|max:255',
            'phone'      => 'nullable|string|max:20',
            'qty'        => "required|integer|min:1|max:{$maxTickets}"
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
                'name'    => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'email'   => $validated['email'],
                'phone'   => $validated['phone'],
                'qty'     => $validated['qty'],
                'status'  => EventParticipant::STATUS_PENDING,
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
            // 1. Email au participant
            if ((bool) get_setting('event_confirmation_enabled', true)) {
                $this->dynamicMailerService->queue(new EventConfirmationMail($event, $participant), $participant->email);
            }

            // 2. Email admin
            $adminEmail =  get_setting('support_email');
            if ($adminEmail) {
                $this->dynamicMailerService->queue(new AdminEventNotificationMail($event, $participant), $adminEmail);
            }

            Log::info('Emails envoyés avec succès', [
                'participant' => $participant->email,
                'admin' => $adminEmail
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur envoi emails:', [
                'message' => $e->getMessage(),
                'participant_email' => $participant->email
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

        return inertia('frontend/events/registration-confirmation', [
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
    //Formation
    public function formations(Request $request)
    {
        $formations = new FormationCollection(
            Formation::published()
                ->latest()
                ->paginate(9)
                ->appends($request->query())
        );
        $featuredFormation = Formation::where('is_featured', true)->published()->first();

        return inertia('frontend/formations/index', [
            'formations' => $formations,
            'featuredFormation' => $featuredFormation,
            'seo' => SeoService::page('Formations', 'Découvrez nos formations en développement personnel et transformation par les valeurs.'),
        ]);
    }

    public function formation_detail($slug)
    {
        $formation = Formation::published()->where('slug', $slug)->firstOrFail();
        $formation->incrementViews();

        $formationImage = SeoService::firstImageUrl($formation->featured_image ?? []);
        return inertia('frontend/formations/show', [
            'formation' => $formation,
            'seo'       => SeoService::page(
                $formation->title ?? $formation->name ?? '',
                $formation->description ?? $formation->excerpt ?? '',
                $formationImage,
            ),
        ]);
    }


    // public function register_formation(Request $request, $slug)
    // {
    //     Log::info('Début de l\'inscription à la formation', ['slug' => $slug]);

    //     // 1. Récupération et vérification de la formation
    //     $formation = Formation::where('slug', $slug)
    //         ->published()
    //         ->firstOrFail();

    //     // 2. Vérifications préliminaires
    //     if (now() > $formation->end_date) {
    //         return back()->withErrors(['general' => "Cette formation est déjà terminée."]);
    //     }

    //     $formation->loadCount('participants'); // Charge le compte des participants
    //     $availableSeats = $formation->max_participants
    //         ? $formation->max_participants - $formation->participants_count
    //         : PHP_INT_MAX;

    //     if ($availableSeats <= 0) {
    //         return back()->withErrors(['general' => "Désolé, cette formation est complète."]);
    //     }

    //     // 3. Validation
    //     $maxPlaces = $formation->max_participants === null ? 10 : min($availableSeats, 10);

    //     $validationRules = [
    //         'qty' => "required|integer|min:1|max:{$maxPlaces}",
    //         'phone' => 'nullable|string|max:20',
    //     ];

    //     if (!auth()->check()) {
    //         $validationRules['name'] = 'required|string|max:255';
    //         $validationRules['email'] = 'required|email|max:255';
    //     }

    //     $validated = $request->validate($validationRules);

    //     // 4. Transaction
    //     try {
    //         return DB::transaction(function () use ($formation, $validated, $availableSeats) {
    //             // Revérification du nombre de places
    //             if ($validated['qty'] > $availableSeats && $formation->max_participants !== null) {
    //                 return back()->withErrors([
    //                     'qty' => "Il ne reste que {$availableSeats} place(s) disponible(s)."
    //                 ]);
    //             }

    //             // Création du participant
    //             $participant = new FormationParticipant();
    //             $participant->formation_id = $formation->id; // Ajout explicite
    //             $participant->user_id = auth()->id();
    //             $participant->name = $validated['name'] ?? auth()->user()->name;
    //             $participant->email = $validated['email'] ?? auth()->user()->email;
    //             $participant->phone = $validated['phone'];
    //             $participant->qty = $validated['qty'];
    //             $participant->status = FormationParticipant::STATUS_PENDING;
    //             $participant->reference = 'FORM-' . strtoupper(Str::random(8));
    //             $participant->save();

    //             // Session pour utilisateur non connecté
    //             if (!auth()->check()) {
    //                 session()->put('temp_participant_' . $participant->id, true);
    //             }

    //             // Redirection selon le prix
    //             if ($formation->price <= 0) {
    //                 $participant->update(['status' => FormationParticipant::STATUS_COMPLETED]);
    //                 return redirect()->route('formations.registration.confirmation', [
    //                     'slug' => $formation->slug,
    //                     'participant_id' => $participant->id
    //                 ]);
    //             }


    //             return redirect()->route('formations.payment', [
    //                 'slug' => $formation->slug,
    //                 'participant_id' => $participant->id
    //             ]);
    //         });
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors de l\'inscription à la formation', [
    //             'error' => $e->getMessage(),
    //             'formation_id' => $formation->id,
    //             'user_id' => auth()->id(),
    //             'data' => $validated
    //         ]);

    //         return back()->withErrors([
    //             'general' => "Une erreur s'est produite lors de l'inscription. Veuillez réessayer."
    //         ]);
    //     }
    // }
    public function register_formation(Request $request, $slug)
    {
        Log::info('Début de l\'inscription à la formation', ['slug' => $slug]);

        // 1. Récupération et vérification de la formation
        $formation = Formation::where('slug', $slug)
            ->published()
            ->firstOrFail();

        // 2. Vérifications préliminaires
        if (now() > $formation->end_date) {
            return back()->withErrors(['general' => "Cette formation est déjà terminée."]);
        }

        $formation->loadCount('participants'); // Charge le compte des participants
        $availableSeats = $formation->max_participants
            ? $formation->max_participants - $formation->participants_count
            : PHP_INT_MAX;

        if ($availableSeats <= 0) {
            return back()->withErrors(['general' => "Désolé, cette formation est complète."]);
        }

        // 3. Validation
        $maxPlaces = $formation->max_participants === null ? 10 : min($availableSeats, 10);

        $validationRules = [
            'qty' => "required|integer|min:1|max:{$maxPlaces}",
            'phone' => 'nullable|string|max:20',
        ];

        $validationRules['first_name'] = 'required|string|max:255';
        $validationRules['last_name']  = 'required|string|max:255';
        $validationRules['email']      = 'required|email|max:255';

        $validated = $request->validate($validationRules);

        // 4. Transaction
        try {
            return DB::transaction(function () use ($formation, $validated, $availableSeats) {
                // Revérification du nombre de places
                if ($validated['qty'] > $availableSeats && $formation->max_participants !== null) {
                    return back()->withErrors([
                        'qty' => "Il ne reste que {$availableSeats} place(s) disponible(s)."
                    ]);
                }

                // Création du participant
                $participant = new FormationParticipant();
                $participant->formation_id = $formation->id; // Ajout explicite
                $participant->user_id = auth()->id();
                $participant->name = trim($validated['first_name'] . ' ' . $validated['last_name']);
                $participant->email = $validated['email'];
                $participant->phone = $validated['phone'];
                $participant->qty = $validated['qty'];
                $participant->status = FormationParticipant::STATUS_PENDING;
                $participant->reference = 'FORM-' . strtoupper(Str::random(8));
                $participant->save();

                // Session pour utilisateur non connecté
                if (!auth()->check()) {
                    session()->put('temp_participant_' . $participant->id, true);
                }

                // Envoi des emails
                $this->sendFormationConfirmationEmails($formation, $participant);

                // Redirection selon le prix
                if ($formation->price <= 0) {
                    $participant->update(['status' => FormationParticipant::STATUS_COMPLETED]);
                    return redirect()->route('formations.registration.confirmation', [
                        'slug' => $formation->slug,
                        'participant_id' => $participant->id
                    ]);
                }

                return redirect()->route('formations.payment', [
                    'slug' => $formation->slug,
                    'participant_id' => $participant->id
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'inscription à la formation', [
                'error' => $e->getMessage(),
                'formation_id' => $formation->id,
                'user_id' => auth()->id(),
                'data' => $validated
            ]);

            return back()->withErrors([
                'general' => "Une erreur s'est produite lors de l'inscription. Veuillez réessayer."
            ]);
        }
    }

    /**
     * Envoi des emails de confirmation
     */
    protected function sendFormationConfirmationEmails($formation, $participant)
    {
        try {
            // Email au participant
            if ((bool) get_setting('formation_confirmation_enabled', true)) {
                $this->dynamicMailerService->queue(new FormationRegistrationConfirmation($formation, $participant), $participant->email);
            }

            // Email à l'administrateur
            $adminEmail = get_setting('support_email');
            if ($adminEmail) {
                $this->dynamicMailerService->queue(new FormationRegistrationAdminNotification($formation, $participant), $adminEmail);
            }

            Log::info('Emails de confirmation envoyés', [
                'participant_id' => $participant->id,
                'formation_id' => $formation->id
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des emails', [
                'error' => $e->getMessage(),
                'participant_id' => $participant->id,
                'formation_id' => $formation->id
            ]);
        }
    }
    /**
     * Afficher la page de confirmation d'inscription
     */
    public function showConfirmation_formation($slug, $participant_id)
    {
        $formation = Formation::where('slug', $slug)->published()->firstOrFail();
        $participant = FormationParticipant::findOrFail($participant_id);

        if ($participant->formation_id !== $formation->id) {
            abort(404);
        }

        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à accéder à cette page.");
        }

        $participant->load('formation');

        return inertia('frontend/formations/registration-confirmation', [
            'formation' => $formation,
            'registration' => $participant,
            'total' => $formation->price * $participant->qty
        ]);
    }

    /**
     * Annuler une inscription
     */
    public function cancelRegistration_formation(Request $request, $slug, $participant_id)
    {
        $formation = Formation::where('slug', $slug)->firstOrFail();
        $participant = FormationParticipant::findOrFail($participant_id);

        if ($participant->formation_id !== $formation->id) {
            abort(404);
        }

        if (auth()->check()) {
            if ($participant->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403, "Vous n'êtes pas autorisé à effectuer cette action.");
            }
        } elseif (!session()->has('temp_participant_' . $participant_id)) {
            abort(403, "Vous n'êtes pas autorisé à effectuer cette action.");
        }

        $cancellationDeadline = (new \DateTime($formation->start_date))->modify('-24 hours');
        if (now() > $cancellationDeadline && !auth()->user()?->hasRole('admin')) {
            return back()->withErrors([
                'general' => "Les annulations ne sont plus possibles moins de 24h avant le début de la formation."
            ]);
        }

        try {
            DB::beginTransaction();

            $previousStatus = $participant->status;
            $participant->update([
                'status' => FormationParticipant::STATUS_CANCELLED,
                'cancelled_at' => now()
            ]);

            if ($previousStatus === FormationParticipant::STATUS_COMPLETED && $formation->price > 0 && $participant->payment_id) {
                // Logique de remboursement via Stripe à implémenter
            }

            DB::commit();

            return redirect()->route('formations.details', $slug)
                ->with('success', 'Votre inscription a été annulée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();

            logger()->error('Erreur lors de l\'annulation de l\'inscription à la formation:', [
                'message' => $e->getMessage(),
                'formation_id' => $formation->id,
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
    public function downloadInvoice_formation($slug, $reference)
    {
        $formation = Formation::where('slug', $slug)->firstOrFail();
        $registration = FormationParticipant::where('reference', $reference)
            ->where('formation_id', $formation->id)
            ->where('status', 'completed')
            ->firstOrFail();

        if ($formation->price <= 0) {
            abort(404);
        }

        if (auth()->check()) {
            if ($registration->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
                abort(403);
            }
        } elseif (!session()->has('temp_participant_' . $registration->id)) {
            abort(403);
        }

        $data = [
            'formation' => $formation,
            'registration' => $registration,
            'subtotal' => $formation->price * $registration->qty,
            'serviceFee' => $formation->price * $registration->qty * 0.05,
            'total' => $formation->price * $registration->qty * 1.05,
            'date' => $registration->payment_date ?? $registration->created_at,
            'invoice_number' => 'FORM-' . date('Y') . '-' . str_pad($registration->id, 6, '0', STR_PAD_LEFT)
        ];

        $pdf = Pdf::loadView('pdf.formation', $data);
        $pdf->setPaper('a4');
        $pdf->setWarnings(false);

        return $pdf->download('facture_formation_' . $registration->reference . '_' . date('Y-m-d') . '.pdf');
    }
}
