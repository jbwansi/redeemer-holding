<?php

namespace Tests\Feature;

use App\Mail\TestEmailSender;
use App\Services\DynamicMailerService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification as LaravelNotification;
use Illuminate\Mail\SendQueuedMailable;
use Illuminate\Support\Facades\Queue;
use RuntimeException;
use Tests\TestCase;

class StagingMailSafetyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        app()->detectEnvironment(static fn (): string => 'staging');
        config([
            'mail.default' => 'array',
            'mail.staging.mailer' => 'array',
            'mail.staging.allowed_recipients' => ['tester@example.test'],
        ]);
    }

    public function test_default_mail_to_an_allowed_recipient_is_captured(): void
    {
        Mail::to('tester@example.test')->send(new TestEmailSender());

        $this->assertCount(1, Mail::mailer('array')->getSymfonyTransport()->messages());
    }

    public function test_default_mail_to_an_unauthorised_recipient_is_blocked(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('destinataire non autorisé');

        Mail::to('historical@example.test')->send(new TestEmailSender());
    }

    public function test_dynamic_mailer_uses_capture_transport_for_an_allowed_recipient(): void
    {
        app(DynamicMailerService::class)->send(new TestEmailSender(), 'tester@example.test');

        $this->assertCount(1, Mail::mailer('array')->getSymfonyTransport()->messages());
        $this->assertArrayNotHasKey('dynamic_smtp', config('mail.mailers'));
    }

    public function test_dynamic_mailer_blocks_an_unauthorised_recipient(): void
    {
        $this->expectException(RuntimeException::class);

        app(DynamicMailerService::class)->send(new TestEmailSender(), 'historical@example.test');
    }

    public function test_dynamic_queued_mail_is_captured_for_an_allowed_recipient(): void
    {
        Queue::fake();

        app(DynamicMailerService::class)->queue(new TestEmailSender(), 'tester@example.test');

        Queue::assertPushed(
            SendQueuedMailable::class,
            static fn (SendQueuedMailable $job): bool => $job->mailable->mailer === 'array'
        );
    }

    public function test_dynamic_queued_mail_to_an_unauthorised_recipient_is_rejected_before_queueing(): void
    {
        Queue::fake();

        try {
            app(DynamicMailerService::class)->queue(new TestEmailSender(), 'historical@example.test');
            $this->fail('The unauthorised email was not blocked.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('destinataire non autorisé', $exception->getMessage());
        }

        Queue::assertNothingPushed();
    }

    public function test_laravel_notification_to_an_unauthorised_recipient_is_blocked(): void
    {
        $this->expectException(RuntimeException::class);

        Notification::route('mail', 'historical@example.test')->notify(
            new class extends LaravelNotification
            {
                public function via(): array
                {
                    return ['mail'];
                }

                public function toMail(): MailMessage
                {
                    return (new MailMessage)->line('Staging mail safety test.');
                }
            }
        );
    }
}
