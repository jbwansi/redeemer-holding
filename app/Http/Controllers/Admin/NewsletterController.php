<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterChunk;
use App\Mail\NewsletterCampaignMail;
use App\Models\EventParticipant;
use App\Models\FormationParticipant;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\NewsletterUnsubscribe;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function index()
    {
        return inertia('backend/newsletters/index', [
            'segments' => [
                'newsletter_subscribers' => NewsletterSubscriber::whereNotNull('email')->distinct('email')->count('email'),
                'users' => User::whereNotNull('email')->distinct('email')->count('email'),
                'event_participants' => EventParticipant::whereNotNull('email')->distinct('email')->count('email'),
                'formation_participants' => FormationParticipant::whereNotNull('email')->distinct('email')->count('email'),
                'service_requests' => ServiceRequest::whereNotNull('email')->distinct('email')->count('email'),
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
        ]);

        $recipients = $this->resolveRecipients($validated['segments'], $validated['custom_emails'] ?? null);
        $unsubscribedEmails = NewsletterUnsubscribe::query()->pluck('email');
        $recipients = $recipients->diff($unsubscribedEmails)->values();

        if (($validated['test_mode'] ?? false) === true) {
            if (empty($validated['test_email'])) {
                return back()->withErrors(['test_email' => 'Veuillez renseigner un email de test.']);
            }

            Mail::to($validated['test_email'])->send(new NewsletterCampaignMail(
                subject: $validated['subject'],
                headline: $validated['headline'],
                content: $validated['content'],
                ctaText: $validated['cta_text'] ?? null,
                ctaUrl: $validated['cta_url'] ?? null,
            ));

            return back()->with('success', 'Email de test envoye avec succes.');
        }

        if ($recipients->isEmpty()) {
            return back()->withErrors(['segments' => 'Aucun destinataire valide trouve pour les segments choisis.']);
        }

        $campaign = NewsletterCampaign::query()->create([
            'subject' => $validated['subject'],
            'headline' => $validated['headline'],
            'content' => $validated['content'],
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'segments' => $validated['segments'],
            'status' => 'queued',
            'total_recipients' => $recipients->count(),
            'queued_at' => now(),
            'created_by' => auth()->id(),
        ]);

        foreach ($recipients->chunk(100) as $chunk) {
            SendNewsletterChunk::dispatch($campaign->id, $chunk->values()->all());
        }

        return back()->with('success', 'Campagne mise en file pour ' . $recipients->count() . ' destinataire(s).');
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($validated['email']));

        NewsletterSubscriber::query()->updateOrCreate(
            ['email' => $email],
            [
                'source' => 'footer_form',
                'subscribed_at' => now(),
            ]
        );

        NewsletterUnsubscribe::query()->where('email', $email)->delete();

        return back()->with('success', 'Inscription newsletter confirmee.');
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
                            'subscribed_at' => now(),
                        ]
                    );

                    $imported++;
                }
            });

        return back()->with('success', $imported . ' contact(s) utilisateur importe(s) dans la newsletter.');
    }

    private function resolveRecipients(array $segments, ?string $customEmails): Collection
    {
        $emails = collect();

        foreach ($segments as $segment) {
            if ($segment === 'newsletter_subscribers') {
                $emails = $emails->merge(NewsletterSubscriber::query()->whereNotNull('email')->pluck('email'));
                continue;
            }

            if ($segment === 'users') {
                $emails = $emails->merge(User::query()->whereNotNull('email')->pluck('email'));
                continue;
            }

            if ($segment === 'event_participants') {
                $emails = $emails->merge(EventParticipant::query()->whereNotNull('email')->pluck('email'));
                continue;
            }

            if ($segment === 'formation_participants') {
                $emails = $emails->merge(FormationParticipant::query()->whereNotNull('email')->pluck('email'));
                continue;
            }

            if ($segment === 'service_requests') {
                $emails = $emails->merge(ServiceRequest::query()->whereNotNull('email')->pluck('email'));
                continue;
            }

            if ($segment === 'custom' && !empty($customEmails)) {
                $custom = preg_split('/[\s,;]+/', $customEmails) ?: [];
                $emails = $emails->merge($custom);
            }
        }

        return $emails
            ->map(fn ($email) => strtolower(trim((string) $email)))
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values();
    }
}
