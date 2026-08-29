<?php

namespace Tests\Feature;

use App\Jobs\SendNewsletterChunk;
use App\Mail\NewsletterCampaignMail;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterUnsubscribe;
use App\Models\User;
use App\Services\DynamicMailerService;
use App\Services\NewsletterAudienceResolver;
use App\Services\SettingsService;
use App\Support\NewsletterSegments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\DB;
use Mockery;
use Tests\TestCase;

class NewsletterPhaseN1Test extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'array']);
    }

    public function test_live_send_kill_switch_defaults_to_disabled(): void
    {
        $this->assertFalse(config('newsletter.live_send_enabled'));
    }

    public function test_testing_never_uses_dynamic_smtp_even_when_flag_is_enabled(): void
    {
        Mail::fake();
        config(['newsletter.live_send_enabled' => true]);
        $settings = Mockery::mock(SettingsService::class);
        $settings->shouldNotReceive('getAllSettings');

        (new DynamicMailerService($settings))->send(
            new NewsletterCampaignMail('Sujet', 'Titre', 'Contenu'),
            'reader@example.test',
        );

        Mail::assertSent(NewsletterCampaignMail::class);
        $this->assertArrayNotHasKey('dynamic_smtp', config('mail.mailers'));
    }

    public function test_local_never_uses_dynamic_smtp_even_when_flag_is_enabled(): void
    {
        Mail::fake();
        config(['newsletter.live_send_enabled' => true]);
        $this->app->detectEnvironment(fn (): string => 'local');
        $settings = Mockery::mock(SettingsService::class);
        $settings->shouldNotReceive('getAllSettings');

        (new DynamicMailerService($settings))->send(
            new NewsletterCampaignMail('Sujet', 'Titre', 'Contenu'),
            'local@example.test',
        );

        Mail::assertSent(NewsletterCampaignMail::class);
    }

    public function test_captured_send_logs_no_address_content_or_smtp_username(): void
    {
        Mail::fake();
        $logPath = sys_get_temp_dir().DIRECTORY_SEPARATOR.'newsletter-phase-n1.log';
        @unlink($logPath);
        config([
            'newsletter.live_send_enabled' => false,
            'logging.channels.newsletter' => ['driver' => 'single', 'path' => $logPath],
            'mail.mailers.smtp.username' => 'sensitive-smtp-user',
        ]);
        $settings = Mockery::mock(SettingsService::class);

        (new DynamicMailerService($settings))->send(
            new NewsletterCampaignMail('Sensitive subject', 'Sensitive headline', 'Sensitive body'),
            'private-recipient@example.test',
        );

        $log = file_get_contents($logPath);
        $this->assertStringNotContainsString('private-recipient@example.test', $log);
        $this->assertStringNotContainsString('Sensitive body', $log);
        $this->assertStringNotContainsString('sensitive-smtp-user', $log);
        $this->assertStringContainsString('newsletter_mail_captured', $log);
    }

    public function test_job_contains_only_serializable_data_and_resolves_mailer_in_handle(): void
    {
        $campaign = $this->campaign(['custom'], ['reader@example.test']);
        $job = unserialize(serialize(new SendNewsletterChunk($campaign->id, ['reader@example.test'])));
        $mailer = Mockery::mock(DynamicMailerService::class);
        $mailer->shouldReceive('send')->once();

        $job->handle($mailer);

        $this->assertSame(1, $campaign->fresh()->sent_count);
    }

    public function test_controller_queues_immediate_campaign_with_canonical_segment_and_unique_audience(): void
    {
        Queue::fake();
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);

        $this->actingAs($admin)->post(route('newsletters.send'), $this->payload([
            'segments' => ['formation_participants', 'custom'],
            'custom_emails' => ' One@Example.test;one@example.test invalid',
        ]))->assertSessionHasNoErrors();

        $campaign = NewsletterCampaign::query()->sole();
        $this->assertSame(['training_participants', 'custom'], $campaign->segments);
        $this->assertSame(['one@example.test'], $campaign->custom_emails);
        Queue::assertPushed(SendNewsletterChunk::class, fn ($job) => $job->campaignId === $campaign->id
            && $job->emails === ['one@example.test']);
    }

    public function test_scheduled_campaign_persists_zurich_time_and_custom_emails_without_dispatching(): void
    {
        Queue::fake();
        Carbon::setTestNow(Carbon::parse('2026-08-25 10:00:00', 'UTC'));
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);

        $this->actingAs($admin)->post(route('newsletters.send'), $this->payload([
            'segments' => ['custom'],
            'custom_emails' => ' Future@Example.test future@example.test',
            'scheduled_at' => '2026-08-25T14:00',
        ]))->assertSessionHasNoErrors();

        $campaign = NewsletterCampaign::query()->sole();
        $this->assertSame('scheduled', $campaign->status);
        $this->assertSame('2026-08-25 12:00:00', DB::table('newsletter_campaigns')->value('scheduled_at'));
        $this->assertSame(['future@example.test'], $campaign->custom_emails);
        Queue::assertNothingPushed();
    }

    public function test_past_schedule_is_rejected(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-25 10:00:00', 'UTC'));
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);

        $this->actingAs($admin)->post(route('newsletters.send'), $this->payload([
            'scheduled_at' => '2026-08-25T09:00',
        ]))->assertSessionHasErrors('scheduled_at');

        $this->assertDatabaseCount('newsletter_campaigns', 0);
    }

    public function test_scheduler_dispatches_due_campaign_once_and_preserves_same_filtered_audience(): void
    {
        Queue::fake();
        Carbon::setTestNow('2026-08-25 12:00:00');
        NewsletterUnsubscribe::query()->create([
            'email' => 'blocked@example.test',
            'source' => 'test',
            'unsubscribed_at' => now(),
        ]);
        $campaign = $this->campaign(
            ['custom'],
            ['valid@example.test', 'VALID@example.test', 'blocked@example.test', 'bad'],
            now()->subMinute(),
        );

        $expected = app(NewsletterAudienceResolver::class)
            ->resolve($campaign->segments, $campaign->custom_emails)->all();
        $this->artisan('newsletters:dispatch-scheduled')->assertSuccessful();
        $this->artisan('newsletters:dispatch-scheduled')->assertSuccessful();

        $this->assertSame(['valid@example.test'], $expected);
        Queue::assertPushed(SendNewsletterChunk::class, 1);
        Queue::assertPushed(SendNewsletterChunk::class, fn ($job) => $job->emails === $expected);
        $this->assertSame('queued', $campaign->fresh()->status);
    }

    public function test_future_campaign_is_not_dispatched(): void
    {
        Queue::fake();
        $this->campaign(['custom'], ['future@example.test'], now()->addHour());

        $this->artisan('newsletters:dispatch-scheduled')->assertSuccessful();

        Queue::assertNothingPushed();
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'subject' => 'Sujet',
            'headline' => 'Titre',
            'content' => 'Contenu',
            'segments' => ['custom'],
            'custom_emails' => 'reader@example.test',
            'test_mode' => false,
        ], $overrides);
    }

    private function campaign(array $segments, array $customEmails, ?Carbon $scheduledAt = null): NewsletterCampaign
    {
        return NewsletterCampaign::query()->create([
            'subject' => 'Sujet',
            'headline' => 'Titre',
            'content' => 'Contenu',
            'segments' => NewsletterSegments::normalize($segments),
            'custom_emails' => $customEmails,
            'status' => $scheduledAt ? 'scheduled' : 'queued',
            'scheduled_at' => $scheduledAt,
            'total_recipients' => count($customEmails),
        ]);
    }
}
