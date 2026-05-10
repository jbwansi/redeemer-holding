<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\FormationParticipant;
use App\Models\PageContent;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Http\Resources\Formation\FormationCollection;
use App\Services\DynamicMailerService;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationConfirmationMail;
use App\Mail\RegistrationAdminNotificationMail;

class FormationController extends Controller
{

    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
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

        $featuredFormation = Formation::where('is_featured', true)
            ->published()
            ->first();

        $pageContent = PageContent::where('page', 'formations')
            ->pluck('value', 'key');

        return inertia('frontend/formations/index', [
            'formations' => $formations,
            'featuredFormation' => $featuredFormation,
            'pageContent' => $pageContent,
            'seo' => SeoService::page(
                'Formations',
                'Découvrez nos formations en développement personnel et transformation par les valeurs.'
            ),
        ]);
    }

    public function formation_detail($slug)
    {
        $formation = Formation::published()->where('slug', $slug)->firstOrFail();
        $formation->incrementViews();

        $formationImage = SeoService::firstImageUrl($formation->featured_image ?? []);
        return inertia('frontend/formations/show', [
            'formation' => $formation,
            'seo' => SeoService::page(
                $formation->title ?? $formation->name ?? '',
                $formation->description ?? $formation->excerpt ?? '',
                $formationImage,
            ),
        ]);
    }


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
        $validationRules['last_name'] = 'required|string|max:255';
        $validationRules['email'] = 'required|email|max:255';

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
        if ((bool) get_setting('formation_confirmation_enabled', true)) {
            $this->dynamicMailerService->queue(
                new RegistrationConfirmationMail(
                    type: 'formation',
                    item: $formation,
                    participant: $participant,
                ),
                $participant->email
            );
        }

        $adminEmail = get_setting('support_email');

        if ($adminEmail) {
            $this->dynamicMailerService->queue(
                new RegistrationAdminNotificationMail(
                    type: 'formation',
                    item: $formation,
                    participant: $participant,
                ),
                $adminEmail
            );
        }

        Log::info('Emails de confirmation formation envoyés', [
            'participant_id' => $participant->id,
            'formation_id' => $formation->id,
        ]);
    } catch (\Exception $e) {
        Log::error('Erreur lors de l’envoi des emails formation', [
            'error' => $e->getMessage(),
            'participant_id' => $participant->id,
            'formation_id' => $formation->id,
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
