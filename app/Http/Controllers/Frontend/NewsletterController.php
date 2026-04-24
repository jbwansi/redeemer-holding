<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Mail\ConfirmNewsletterSubscriptionMail;
use App\Models\NewsletterSubscriber;
use App\Models\NewsletterUnsubscribe;
use App\Services\DynamicMailerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    protected DynamicMailerService $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
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
            Log::channel('newsletter')->info('SMTP config test', [
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'from' => config('mail.from.address'),
            ]);

            $this->dynamicMailerService->send(
                new ConfirmNewsletterSubscriptionMail($subscriber),
                $email
            );

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

        if (! $subscriber) {
            return redirect()->route('newsletter.confirmation', ['status' => 'invalid']);
        }

        $subscriber->update([
            'confirmed_at' => now(),
            'confirmation_token' => null,
        ]);

        NewsletterUnsubscribe::query()
            ->where('email', $subscriber->email)
            ->delete();

        return redirect()->route('newsletter.confirmation', ['status' => 'success']);
    }

    public function unsubscribe(Request $request, string $email): Response
    {
        if (! $request->hasValidSignature()) {
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
}