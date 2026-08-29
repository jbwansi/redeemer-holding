<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class DynamicMailerService
{
    protected $settingsService;

    public function __construct(SettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    public function send($mailable, string $to): void
    {
        if (app()->environment('staging')) {
            $this->assertAllowedStagingRecipient($to);
        }

        if (! $this->liveSendEnabled()) {
            Mail::mailer('array')->to($to)->send($mailable);
            Log::channel('newsletter')->info('Email capturé par le verrou newsletter.', [
                'operation' => 'newsletter_mail_captured',
                'recipient_hash' => hash('sha256', strtolower(trim($to))),
                'mailable' => get_class($mailable),
            ]);

            return;
        }

        $settings = $this->settingsService->getAllSettings();

        $host = $settings['host'] ?? null;
        $port = isset($settings['port']) ? (int) $settings['port'] : 587;
        $encryption = $settings['encryption'] ?? null;
        $username = $settings['username'] ?? null;
        $password = $settings['password'] ?? null;

        if ($encryption === 'none') {
            $encryption = null;
        }

        $fromEmail = $settings['sender_email'] ?? config('mail.from.address') ?? 'no-reply@example.com';
        $fromName = $settings['sender_name'] ?? config('mail.from.name') ?? config('app.name');

        config([
            'mail.mailers.dynamic_smtp' => [
                'transport' => 'smtp',
                'host' => $host,
                'port' => $port,
                'encryption' => $encryption,
                'username' => $username,
                'password' => $password,
                'timeout' => null,
            ],
        ]);

        Log::channel('newsletter')->info('DynamicMailerService send', [
            'operation' => 'dynamic_mail_send',
            'recipient_hash' => hash('sha256', strtolower(trim($to))),
            'mailable' => get_class($mailable),
        ]);

        Mail::mailer('dynamic_smtp')
            ->to($to)
            ->send(
                $mailable->from($fromEmail, $fromName)
            );
    }

    public function queue($mailable, string $to): void
    {
        if (app()->environment('staging')) {
            $this->assertAllowedStagingRecipient($to);
        }

        if (! $this->liveSendEnabled()) {
            Mail::mailer('array')->to($to)->queue($mailable);
            Log::channel('newsletter')->info('Email en queue capturé par le verrou newsletter.', [
                'operation' => 'newsletter_mail_queue_captured',
                'recipient_hash' => hash('sha256', strtolower(trim($to))),
                'mailable' => get_class($mailable),
            ]);

            return;
        }

        $settings = $this->settingsService->getAllSettings();

        $host = $settings['host'] ?? config('mail.mailers.smtp.host');
        $port = isset($settings['port']) ? (int) $settings['port'] : config('mail.mailers.smtp.port');
        $encryption = $settings['encryption'] ?? null;
        $username = $settings['username'] ?? config('mail.mailers.smtp.username');
        $password = $settings['password'] ?? config('mail.mailers.smtp.password');

        if ($encryption === 'none') {
            $encryption = null;
        }

        $fromEmail = $settings['sender_email'] ?? config('mail.from.address') ?? 'no-reply@example.com';
        $fromName = $settings['sender_name'] ?? config('mail.from.name') ?? config('app.name');

        config([
            'mail.mailers.dynamic_smtp' => [
                'transport' => 'smtp',
                'host' => $host,
                'port' => $port,
                'encryption' => $encryption,
                'username' => $username,
                'password' => $password,
                'timeout' => null,
            ],
        ]);

        Log::channel('newsletter')->info('DynamicMailerService queue', [
            'operation' => 'dynamic_mail_queue',
            'recipient_hash' => hash('sha256', strtolower(trim($to))),
            'mailable' => get_class($mailable),
        ]);

        Mail::mailer('dynamic_smtp')
            ->to($to)
            ->queue(
                $mailable->from($fromEmail, $fromName)
            );
    }

    private function assertAllowedStagingRecipient(string $recipient): void
    {
        $allowed = array_map(
            static fn ($email): string => strtolower(trim((string) $email)),
            config('mail.staging.allowed_recipients', []),
        );

        if (!in_array(strtolower(trim($recipient)), $allowed, true)) {
            throw new RuntimeException('Envoi email staging bloqué : destinataire non autorisé.');
        }
    }

    private function liveSendEnabled(): bool
    {
        return config('newsletter.live_send_enabled', false)
            && app()->environment(['production', 'staging']);
    }
}
