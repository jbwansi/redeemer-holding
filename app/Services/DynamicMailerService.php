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
            Mail::mailer('array')->to($to)->send($mailable);

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
            'to' => $to,
            'host' => $host,
            'port' => $port,
            'encryption' => $encryption,
            'username' => $username,
            'from' => $fromEmail,
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
            Mail::mailer('array')->to($to)->queue($mailable);

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
            'to' => $to,
            'host' => $host,
            'port' => $port,
            'encryption' => $encryption,
            'username' => $username,
            'from' => $fromEmail,
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
}
