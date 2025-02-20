<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\EventCollection;
use App\Http\Resources\Event\EventResource;
use App\Http\Resources\Post\PostCollection;
use App\Http\Resources\Post\PostResource;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventParticipant;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WebController extends Controller
{
    public function formations()
    {
        return inertia('frontend/formations/index');
    }

    public function formation_detail($slug)
    {
        return inertia('frontend/formations/show');
    }


    public function blogs()
    {

        $posts = new PostCollection(Post::with(['user', 'categories'])->published()->latest()->get());
        $featuredPost = PostResource::make(Post::with(['user', 'categories'])->published()->latest()->first());
        $categories = Category::orderBy('name')->withCount('posts')->get();
        //recuperer toutes les tags des posts
        $tags = [];
        foreach ($posts as $post) {
            foreach ($post->tags ?? [] as $tag) {
                array_push($tags, $tag);
            }
        }

        return inertia('frontend/blogs/index', ['tags' => $tags, 'posts' => $posts, 'categories' => $categories, 'featuredPost' => $featuredPost]);
    }

    public function blog_detail($slug)
    {

        $blog = PostResource::make(Post::with(['user', 'categories'])->published()->where('slug', $slug)->first());

        return inertia('frontend/blogs/show', ['post' => $blog]);
    }


    public function events()
    {
        $events = new EventCollection(Event::with(['category'])->published()->get());

        $categories = EventCategory::orderBy('name')->withCount('events')->get();
        $featuredEvent = Event::with(['category'])->where('is_featured', true)->published()->first();
        return inertia('frontend/events/index', ['events' => $events, 'categories' => $categories, 'featuredEvent' => $featuredEvent]);
    }

    public function evenement_detail($slug)
    {
        $event = Event::with(['category'])->published()->where('slug', $slug)->first();
        return inertia('frontend/events/show', ['event' => $event]);
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
            'name' => auth()->check() ? 'nullable|string|max:255' : 'required|string|max:255',
            'email' => auth()->check() ? 'nullable|email|max:255' : 'required|email|max:255',
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
                'name' => $validated['name'] ?? auth()->user()->name,
                'email' => $validated['email'] ?? auth()->user()->email,
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
                // ... logique d'envoi d'email
                // dd("bug");
                return redirect()->route('events.registration.confirmation', [
                    'slug' => $event->slug,
                    'participant_id' => $participant->id
                ]);
            }
            // dd("pay");
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
            $participant->update([
                'status' => EventParticipant::STATUS_CANCELLED,
                'cancelled_at' => now()
            ]);

            // Si le participant avait payé, traiter le remboursement si applicable
            if ($participant->status === EventParticipant::STATUS_COMPLETED && $event->price > 0 && $participant->payment_id) {
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
}
