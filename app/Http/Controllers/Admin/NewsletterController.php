<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterChunk;
use App\Mail\ConfirmNewsletterSubscriptionMail;
use App\Mail\NewsletterCampaignMail;
use App\Models\EventContact;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\NewsletterUnsubscribe;
use App\Models\User;
use App\Services\DynamicMailerService;
use App\Services\NewsletterAudienceResolver;
use App\Support\NewsletterSegments;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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

            'eventContactsCount' => EventContact::query()->count(),
            'eventContacts' => EventContact::query()->latest()->get([
                'id',
                'email',
                'first_name',
                'last_name',
                'event_type',
                'event_name',
                'event_date',
                'source',
                'file_source',
                'imported_at',
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

                    if (NewsletterUnsubscribe::query()->where('email', $email)->exists()) {
                        continue;
                    }

                    $subscriber = NewsletterSubscriber::query()->where('email', $email)->first();

                    if ($subscriber && $subscriber->consent_status === 'declined') {
                        continue;
                    }

                    NewsletterSubscriber::query()->updateOrCreate(
                        ['email' => $email],
                        [
                            'source' => 'users_import',
                            'status' => 'imported',
                            'consent_status' => 'granted',
                            'consent_source' => 'users_import',
                            'consent_verified_at' => now(),
                            'consent_proof' => 'user_profile_email',
                            'imported_at' => $subscriber?->imported_at ?? now(),
                            'confirmed_at' => $subscriber?->confirmed_at ?? null,
                            'subscribed_at' => $subscriber?->subscribed_at ?? now(),
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

    public function downloadImportTemplate(): Response
    {
        $content = "email;first_name;last_name;consent\n";
        $content .= "prenom.nom@example.com;Prenom;Nom;oui\n";
        $content .= "contact@example.com;Contact;Exemple;non\n";

        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="newsletter-import-template.csv"',
        ]);
    }

    public function importEventContacts(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (! is_resource($handle)) {
            return back()->withErrors(['file' => 'Impossible de lire ce fichier CSV.']);
        }

        $headerLine = fgets($handle);
        rewind($handle);

        $delimiter = ';';
        if (is_string($headerLine)) {
            $commaCount = substr_count($headerLine, ',');
            $semicolonCount = substr_count($headerLine, ';');
            $delimiter = $commaCount > $semicolonCount ? ',' : ';';
        }

        $headers = fgetcsv($handle, 0, $delimiter);
        if (! is_array($headers)) {
            fclose($handle);
            return back()->withErrors(['file' => 'Le fichier CSV est vide ou invalide.']);
        }

        $normalizedHeaders = array_map(static fn (string $header): string => strtolower(trim($header)), $headers);
        $emailIndex = array_search('email', $normalizedHeaders, true);
        if ($emailIndex === false) {
            fclose($handle);
            return back()->withErrors(['file' => 'Le CSV doit contenir une colonne email.']);
        }

        $imported = 0;
        $invalid = 0;
        $blocked = 0;
        $sourceName = $file->getClientOriginalName();

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (! is_array($row) || (count($row) === 1 && trim((string) $row[0]) === '')) {
                continue;
            }

            $payload = [];
            foreach ($headers as $index => $header) {
                $payload[strtolower(trim((string) $header))] = $row[$index] ?? null;
            }

            $email = strtolower(trim((string) ($payload['email'] ?? '')));
            if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $invalid++;
                continue;
            }

            if (NewsletterUnsubscribe::query()->where('email', $email)->exists()) {
                $blocked++;
                continue;
            }

            $eventType = trim((string) ($payload['event_type'] ?? ''));
            $eventName = trim((string) ($payload['event_name'] ?? ''));
            $eventDate = trim((string) ($payload['event_date'] ?? ''));
            $firstName = trim((string) ($payload['first_name'] ?? ''));
            $lastName = trim((string) ($payload['last_name'] ?? ''));
            $fileSource = trim((string) ($payload['source'] ?? $sourceName));

            EventContact::query()->updateOrCreate(
                ['email' => $email],
                [
                    'first_name' => $firstName !== '' ? $firstName : null,
                    'last_name' => $lastName !== '' ? $lastName : null,
                    'event_type' => $eventType !== '' ? $eventType : null,
                    'event_name' => $eventName !== '' ? $eventName : null,
                    'event_date' => $eventDate !== '' ? $eventDate : null,
                    'source' => 'event_import',
                    'file_source' => $fileSource !== '' ? $fileSource : $sourceName,
                    'imported_at' => now(),
                    'notes' => $eventType !== '' || $eventName !== '' || $eventDate !== ''
                        ? sprintf('%s | %s | %s', $eventType, $eventName, $eventDate)
                        : null,
                ]
            );

            $imported++;
        }

        fclose($handle);

        return back()->with(
            'success',
            sprintf('Import contacts événement terminé : %d ajouté(s), %d invalide(s), %d bloqué(s).', $imported, $invalid, $blocked)
        );
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (!is_resource($handle)) {
            return back()->withErrors(['file' => 'Impossible de lire ce fichier CSV.']);
        }

        $headerLine = fgets($handle);
        rewind($handle);

        $delimiter = ';';
        if (is_string($headerLine)) {
            $commaCount = substr_count($headerLine, ',');
            $semicolonCount = substr_count($headerLine, ';');
            $delimiter = $commaCount > $semicolonCount ? ',' : ';';
        }

        $headers = fgetcsv($handle, 0, $delimiter);
        if (!is_array($headers)) {
            fclose($handle);
            return back()->withErrors(['file' => 'Le fichier CSV est vide ou invalide.']);
        }

        $normalizedHeaders = array_map(static fn (string $header): string => strtolower(trim($header)), $headers);
        $emailIndex = array_search('email', $normalizedHeaders, true);
        if ($emailIndex === false) {
            fclose($handle);
            return back()->withErrors(['file' => 'Le CSV doit contenir une colonne email.']);
        }

        $consentIndex = array_search('consent', $normalizedHeaders, true);
        $firstNameIndex = array_search('first_name', $normalizedHeaders, true);
        $lastNameIndex = array_search('last_name', $normalizedHeaders, true);

        $imported = 0;
        $duplicates = 0;
        $invalid = 0;
        $blocked = 0;

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (!is_array($row)) {
                $invalid++;
                continue;
            }

            if (count($row) === 1 && trim((string) $row[0]) === '') {
                continue;
            }

            $payload = [];
            foreach ($headers as $index => $header) {
                $payload[strtolower(trim((string) $header))] = $row[$index] ?? null;
            }

            $email = strtolower(trim((string) ($payload['email'] ?? '')));
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $invalid++;
                continue;
            }

            if (NewsletterUnsubscribe::query()->where('email', $email)->exists()) {
                $blocked++;
                continue;
            }

            $existing = NewsletterSubscriber::query()->where('email', $email)->first();
            if ($existing) {
                if ($existing->consent_status === 'declined' || $existing->status === 'declined') {
                    $blocked++;
                    continue;
                }

                if ($existing->status === 'confirmed' || $existing->status === 'imported' || $existing->consent_status === 'granted') {
                    $duplicates++;
                    continue;
                }
            }

            $consentValue = $consentIndex !== false ? (string) ($payload['consent'] ?? '') : '';
            $consent = $this->normalizeConsentValue($consentValue);
            if ($consent === null) {
                $blocked++;
                continue;
            }

            $status = $consent ? 'imported' : 'declined';
            $consentStatus = $consent ? 'granted' : 'declined';

            $subscriber = NewsletterSubscriber::query()->updateOrCreate(
                ['email' => $email],
                [
                    'first_name' => trim((string) ($payload['first_name'] ?? ($firstNameIndex !== false ? ($row[$firstNameIndex] ?? '') : ''))),
                    'last_name' => trim((string) ($payload['last_name'] ?? ($lastNameIndex !== false ? ($row[$lastNameIndex] ?? '') : ''))),
                    'source' => 'csv_import',
                    'status' => $status,
                    'consent_status' => $consentStatus,
                    'consent_source' => $consent ? 'csv_import' : 'csv_import_declined',
                    'consent_verified_at' => $consent ? now() : null,
                    'consent_proof' => $consent ? $consentValue : 'declined',
                    'subscribed_at' => $existing?->subscribed_at ?? now(),
                    'imported_at' => now(),
                    'confirmed_at' => $existing?->confirmed_at ?? null,
                    'confirmation_token' => $existing?->confirmation_token ?? null,
                ]
            );

            if ($subscriber->wasRecentlyCreated || ($existing === null && $subscriber->exists)) {
                $imported++;
            }
        }

        fclose($handle);

        return back()->with(
            'success',
            sprintf(
                'Import CSV terminé : %d importé(s), %d doublon(s), %d invalide(s), %d refusé(s).',
                $imported,
                $duplicates,
                $invalid,
                $blocked,
            )
        );
    }

    private function normalizeConsentValue(mixed $value): ?bool
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = strtolower(trim((string) $value));
        $granted = ['1', 'true', 'yes', 'oui', 'ok', 'accept', 'accepted', 'agree', 'granted', 'consent'];
        $declined = ['0', 'false', 'no', 'non', 'refus', 'refused', 'decline', 'declined', 'deny', 'denied'];

        if (in_array($normalized, $granted, true)) {
            return true;
        }

        if (in_array($normalized, $declined, true)) {
            return false;
        }

        return null;
    }

}
