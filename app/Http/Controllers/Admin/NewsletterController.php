<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterChunk;
use App\Mail\ConfirmNewsletterSubscriptionMail;
use App\Mail\NewsletterCampaignMail;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\NewsletterUnsubscribe;
use App\Services\DynamicMailerService;
use App\Services\NewsletterAudienceResolver;
use App\Support\NewsletterSegments;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function __construct(
        protected DynamicMailerService $dynamicMailerService,
        protected NewsletterAudienceResolver $audienceResolver,
    ) {}

    public function index()
    {
        return inertia('backend/newsletters/index', [
            'segments' => [
                NewsletterSegments::SUBSCRIBERS => $this->audienceResolver
                    ->resolve([NewsletterSegments::SUBSCRIBERS])->count(),
                NewsletterSegments::USERS => $this->audienceResolver
                    ->resolve([NewsletterSegments::USERS])->count(),
                NewsletterSegments::EVENT_PARTICIPANTS => $this->audienceResolver
                    ->resolve([NewsletterSegments::EVENT_PARTICIPANTS])->count(),
                NewsletterSegments::TRAINING_PARTICIPANTS => $this->audienceResolver
                    ->resolve([NewsletterSegments::TRAINING_PARTICIPANTS])->count(),
                NewsletterSegments::SERVICE_REQUESTS => $this->audienceResolver
                    ->resolve([NewsletterSegments::SERVICE_REQUESTS])->count(),
            ],

            'pendingSubscribersCount' => NewsletterSubscriber::query()
                ->whereNotNull('email')
                ->whereNull('confirmed_at')
                ->distinct('email')
                ->count('email'),

            'confirmedSubscribersCount' => NewsletterSubscriber::query()
                ->whereNotNull('email')
                ->whereNotNull('confirmed_at')
                ->distinct('email')
                ->count('email'),

            'pendingSubscribers' => NewsletterSubscriber::query()
                ->whereNotNull('email')
                ->whereNull('confirmed_at')
                ->latest()
                ->get([
                    'id',
                    'email',
                    'source',
                    'subscribed_at',
                    'confirmation_sent_at',
                    'created_at',
                ]),

            'confirmedSubscribers' => NewsletterSubscriber::query()
                ->whereNotNull('email')
                ->whereNotNull('confirmed_at')
                ->latest()
                ->get([
                    'id',
                    'email',
                    'source',
                    'subscribed_at',
                    'confirmed_at',
                    'created_at',
                ]),

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
        Log::channel('newsletter')->info('Newsletter send: début');


        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:160'],
            'headline' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string', 'max:20000'],
            'cta_text' => ['nullable', 'string', 'max:80'],
            'cta_url' => ['nullable', 'url', 'max:500'],
            'segments' => ['required', 'array', 'min:1'],
            'segments.*' => [Rule::in(NewsletterSegments::accepted())],
            'custom_emails' => ['nullable', 'string', 'max:10000'],
            'test_mode' => ['nullable', 'boolean'],
            'test_email' => ['nullable', 'email', 'max:255'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ]);

        Log::channel('newsletter')->info('Newsletter send: validation OK', [
            'test_mode' => $validated['test_mode'] ?? false,
            'segments' => $validated['segments'],
        ]);

        $segments = NewsletterSegments::normalize($validated['segments']);
        $customEmails = $this->audienceResolver->normalizeCustomEmails(
            $validated['custom_emails'] ?? null
        );
        $recipients = $this->audienceResolver->resolve($segments, $customEmails);


        Log::channel('newsletter')->info('Newsletter send: destinataires résolus', [
            'count' => $recipients->count(),
        ]);

        Log::channel('newsletter')->info('Newsletter send: destinataires après exclusion des désabonnés', [
            'count' => $recipients->count(),
        ]);

        if (($validated['test_mode'] ?? false) === true) {
            Log::channel('newsletter')->info('Newsletter send: mode test', [
                'has_test_email' => ! empty($validated['test_email']),
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

                Log::channel('newsletter')->info('Newsletter send: email de test capturé');
            } catch (\Throwable $e) {
                Log::channel('newsletter')->error('Newsletter send: échec email de test', [
                    'error_type' => $e::class,
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
            ? \Illuminate\Support\Carbon::createFromFormat(
                'Y-m-d\TH:i',
                $validated['scheduled_at'],
                'Europe/Zurich',
            )->utc()
            : null;

        $campaign = NewsletterCampaign::query()->create([
            'subject' => $validated['subject'],
            'headline' => $validated['headline'],
            'content' => $validated['content'],
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'segments' => $segments,
            'custom_emails' => in_array(NewsletterSegments::CUSTOM, $segments, true)
                ? $customEmails
                : null,
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
        Log::channel('newsletter')->info('Subscribe: début');

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($validated['email']));

        Log::channel('newsletter')->info('Subscribe: email validé');

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
            ]);
            return back()->with('success', 'Cette adresse est déjà abonnée à la newsletter.');
        }

        $token = Str::uuid()->toString();


        Log::channel('newsletter')->info('Subscribe: token généré');

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
            'confirmation_sent_at' => $subscriber->confirmation_sent_at,
        ]);

        try {

            $this->dynamicMailerService->send(new ConfirmNewsletterSubscriptionMail($subscriber), $email);

            Log::channel('newsletter')->info('Subscribe: email de confirmation envoyé', [
                'subscriber_id' => $subscriber->id,
            ]);
        } catch (\Throwable $e) {
            Log::channel('newsletter')->error('Subscribe: échec envoi mail', [
                'subscriber_id' => $subscriber->id ?? null,
                'error_type' => $e::class,
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

}
