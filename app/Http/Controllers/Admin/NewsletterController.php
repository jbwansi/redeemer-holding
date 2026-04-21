<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterChunk;
use App\Mail\ConfirmNewsletterSubscriptionMail;
use App\Mail\NewsletterCampaignMail;
use App\Models\EventParticipant;
use App\Models\FormationParticipant;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\NewsletterUnsubscribe;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Services\DynamicMailerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    protected DynamicMailerService $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }

    public function index()
    {
        return inertia('backend/newsletters/index', [
            'segments' => [
                'newsletter_subscribers' => NewsletterSubscriber::query()
                    ->whereNotNull('email')
                    ->whereNotNull('confirmed_at')
                    ->distinct('email')
                    ->count('email'),

                'users' => User::query()
                    ->whereNotNull('email')
                    ->distinct('email')
                    ->count('email'),

                'event_participants' => EventParticipant::query()
                    ->whereNotNull('email')
                    ->distinct('email')
                    ->count('email'),

                'formation_participants' => FormationParticipant::query()
                    ->whereNotNull('email')
                    ->distinct('email')
                    ->count('email'),

                'service_requests' => ServiceRequest::query()
                    ->whereNotNull('email')
                    ->distinct('email')
                    ->count('email'),
            ],

            'history' => NewsletterCampaign::query()
                ->latest()
                ->limit(20)
                ->get([
                    'id',
                    'subject',
                    'status',
                    'total_recipients',
                    'sent_count',
                    'failed_count',
                    'queued_at',
                    'started_at',
                    'completed_at',
                    'created_at',
                ]),

            'unsubscribedCount' => NewsletterUnsubscribe::query()->count(),
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        Log::channel('newsletter')->info('Subscribe: début', [
            'ip' => $request->ip(),
            'email_input' => $request->input('email'),
        ]);


        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:160'],
            'headline' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string', 'max:20000'],
            'cta_text' => ['nullable', 'string', 'max:80'],
            'cta_url' => ['nullable', 'url', 'max:500'],
            'segments' => ['required', 'array', 'min:1'],
            'segments.*' => ['in:newsletter_subscribers,users,event_participants,formation_participants,service_requests,custom'],
            'custom_emails' => ['nullable', 'string', 'max:10000'],
            'test_mode' => ['nullable', 'boolean'],
            'test_email' => ['nullable', 'email', 'max:255'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ]);

        Log::channel('newsletter')->info('Newsletter send: validation OK', [
            'test_mode' => $validated['test_mode'] ?? false,
            'test_email' => $validated['test_email'] ?? null,
            'segments' => $validated['segments'],
        ]);

        $recipients = $this->resolveRecipients(
            $validated['segments'],
            $validated['custom_emails'] ?? null
        );


        Log::channel('newsletter')->info('Newsletter send: destinataires résolus', [
            'count' => $recipients->count(),
        ]);

        $unsubscribedEmails = NewsletterUnsubscribe::query()->pluck('email');
        $recipients = $recipients->diff($unsubscribedEmails)->values();

        Log::channel('newsletter')->info('Newsletter send: destinataires après exclusion des désabonnés', [
            'count' => $recipients->count(),
        ]);

        if (($validated['test_mode'] ?? false) === true) {
            Log::channel('newsletter')->info('Newsletter send: mode test', [
                'test_email' => $validated['test_email'] ?? null,
            ]);

            if (empty($validated['test_email'])) {
                Log::channel('newsletter')->warning('Newsletter send: test_mode sans test_email');

                return back()->withErrors([
                    'test_email' => 'Veuillez renseigner un email de test.',
                ]);
            }

            try {
                $this->dynamicMailerService->send(
                    new NewsletterCampaignMail(
                        subject: $validated['subject'],
                        headline: $validated['headline'],
                        content: $validated['content'],
                        ctaText: $validated['cta_text'] ?? null,
                        ctaUrl: $validated['cta_url'] ?? null,
                    ),
                    $validated['test_email']
                );

                Log::channel('newsletter')->info('Newsletter send: email de test envoyé', [
                    'test_email' => $validated['test_email'],
                ]);
            } catch (\Throwable $e) {
                Log::channel('newsletter')->error('Newsletter send: échec email de test', [
                    'test_email' => $validated['test_email'],
                    'message' => $e->getMessage(),
                ]);

                return back()->withErrors([
                    'test_email' => 'Échec lors de l’envoi du mail de test.',
                ]);
            }

            return back()->with('success', 'Email de test envoyé avec succès.');
        }

        if ($recipients->isEmpty()) {
            Log::channel('newsletter')->warning('Newsletter send: aucun destinataire valide');

            return back()->withErrors([
                'segments' => 'Aucun destinataire valide trouvé pour les segments choisis.',
            ]);
        }

        $scheduledAt = !empty($validated['scheduled_at'])
            ? \Illuminate\Support\Carbon::parse($validated['scheduled_at'])
            : null;

        $campaign = NewsletterCampaign::query()->create([
            'subject' => $validated['subject'],
            'headline' => $validated['headline'],
            'content' => $validated['content'],
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'segments' => $validated['segments'],
            'status' => $scheduledAt ? 'scheduled' : 'queued',
            'total_recipients' => $recipients->count(),
            'queued_at' => $scheduledAt ? null : now(),
            'scheduled_at' => $scheduledAt,
            'created_by' => auth()->id(),
        ]);

        if ($scheduledAt) {
            return back()->with(
                'success',
                'Campagne programmée pour le ' . $scheduledAt->format('d/m/Y à H:i') . '.'
            );
        }

        foreach ($recipients->chunk(100) as $chunk) {
            SendNewsletterChunk::dispatch($campaign->id, $chunk->values()->all());
        }

        return back()->with(
            'success',
            'Campagne mise en file pour ' . $recipients->count() . ' destinataire(s).'
        );
    }

    public function subscribe(Request $request): RedirectResponse
    {
        Log::channel('newsletter')->info('Subscribe: début', [
            'ip' => $request->ip(),
            'email_input' => $request->input('email'),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($validated['email']));

        Log::channel('newsletter')->info('Subscribe: email validé', [
            'email' => $email,
        ]);

        $subscriber = NewsletterSubscriber::query()
            ->where('email', $email)
            ->first();

        Log::channel('newsletter')->info('Subscribe: subscriber recherché', [
            'found' => $subscriber !== null,
            'subscriber_id' => $subscriber?->id,
            'confirmed_at' => $subscriber?->confirmed_at,
        ]);

        if ($subscriber && $subscriber->confirmed_at) {
            Log::channel('newsletter')->info('Subscribe: déjà confirmé', [
                'subscriber_id' => $subscriber->id,
                'email' => $email,
            ]);
            return back()->with('success', 'Cette adresse est déjà abonnée à la newsletter.');
        }

        $token = Str::uuid()->toString();


        Log::channel('newsletter')->info('Subscribe: token généré', [
            'email' => $email,
            'token' => $token,
        ]);

        $subscriber = NewsletterSubscriber::query()->updateOrCreate(
            ['email' => $email],
            [
                'source' => 'footer_form',
                'subscribed_at' => $subscriber?->subscribed_at ?? now(),
                'confirmation_token' => $token,
                'confirmation_sent_at' => now(),
                'confirmed_at' => null,
            ]
        );

        Log::channel('newsletter')->info('Subscribe: subscriber sauvegardé', [
            'subscriber_id' => $subscriber->id,
            'email' => $subscriber->email,
            'confirmation_token' => $subscriber->confirmation_token,
            'confirmation_sent_at' => $subscriber->confirmation_sent_at,
        ]);

        try {

            // 🔥 AJOUT ICI
            Log::channel('newsletter')->info('SMTP config test', [
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'from' => config('mail.from.address'),
            ]);
            $this->dynamicMailerService->send(new ConfirmNewsletterSubscriptionMail($subscriber), $email);

            Log::channel('newsletter')->info('Subscribe: email de confirmation envoyé', [
                'subscriber_id' => $subscriber->id,
                'email' => $email,
            ]);
        } catch (\Throwable $e) {
            Log::channel('newsletter')->error('Subscribe: échec envoi mail', [
                'subscriber_id' => $subscriber->id ?? null,
                'email' => $email,
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'email' => 'Impossible d’envoyer l’email de confirmation pour le moment.',
            ]);
        }

        return back()->with(
            'success',
            'Merci ! Vérifiez votre boîte mail pour confirmer votre abonnement.'
        );
    }

    public function confirm(string $token): RedirectResponse
    {
        $subscriber = NewsletterSubscriber::query()
            ->where('confirmation_token', $token)
            ->first();

        if (!$subscriber) {
            return redirect()
                ->route('newsletter.confirmation', ['status' => 'invalid']);
        }

        $subscriber->update([
            'confirmed_at' => now(),
            'confirmation_token' => null,
        ]);

        // 🔥 BONUS TODO pour la prochaine fois
        // Mail::to($subscriber->email)->send(new WelcomeNewsletterMail());

        NewsletterUnsubscribe::query()
            ->where('email', $subscriber->email)
            ->delete();

        return redirect()
            ->route('newsletter.confirmation', ['status' => 'success']);
    }

    public function unsubscribe(Request $request, string $email): Response
    {
        if (!$request->hasValidSignature()) {
            abort(403);
        }

        $normalizedEmail = strtolower(trim($email));

        NewsletterUnsubscribe::query()->updateOrCreate(
            ['email' => $normalizedEmail],
            [
                'source' => 'newsletter_link',
                'unsubscribed_at' => now(),
            ]
        );

        return response()->view('newsletter.unsubscribe', [
            'email' => $normalizedEmail,
        ]);
    }

    public function importUsers(): RedirectResponse
    {
        $imported = 0;

        User::query()
            ->whereNotNull('email')
            ->select(['email'])
            ->chunk(500, function ($users) use (&$imported) {
                foreach ($users as $user) {
                    $email = strtolower(trim((string) $user->email));

                    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        continue;
                    }

                    NewsletterSubscriber::query()->updateOrCreate(
                        ['email' => $email],
                        [
                            'source' => 'users_import',
                            'confirmed_at' => now(),
                        ]
                    );

                    $imported++;
                }
            });

        return back()->with(
            'success',
            $imported . ' contact(s) utilisateur importé(s) dans la newsletter.'
        );
    }

    private function resolveRecipients(array $segments, ?string $customEmails): Collection
    {
        $emails = collect();

        foreach ($segments as $segment) {
            if ($segment === 'newsletter_subscribers') {
                $emails = $emails->merge(
                    NewsletterSubscriber::query()
                        ->whereNotNull('email')
                        ->whereNotNull('confirmed_at')
                        ->pluck('email')
                );

                continue;
            }

            if ($segment === 'users') {
                $emails = $emails->merge(
                    User::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );

                continue;
            }

            if ($segment === 'event_participants') {
                $emails = $emails->merge(
                    EventParticipant::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );

                continue;
            }

            if ($segment === 'formation_participants') {
                $emails = $emails->merge(
                    FormationParticipant::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );

                continue;
            }

            if ($segment === 'service_requests') {
                $emails = $emails->merge(
                    ServiceRequest::query()
                        ->whereNotNull('email')
                        ->pluck('email')
                );

                continue;
            }

            if ($segment === 'custom' && !empty($customEmails)) {
                $custom = preg_split('/[\s,;]+/', $customEmails) ?: [];
                $emails = $emails->merge($custom);
            }
        }

        return $emails
            ->map(fn($email) => strtolower(trim((string) $email)))
            ->filter(fn($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values();
    }
}
