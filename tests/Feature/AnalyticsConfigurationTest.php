<?php

namespace Tests\Feature;

use App\Services\GoogleAnalyticsService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class AnalyticsConfigurationTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->directory = storage_path('app/analytics-test-'.bin2hex(random_bytes(8)));
        File::ensureDirectoryExists($this->directory);
        config([
            'services.google_analytics.property_id' => '987654321',
            'services.google_analytics.credentials_path' => 'storage/app/'.basename($this->directory).'/account.json',
        ]);
        // A local check must never resolve the reporting service.
        $this->app->bind(GoogleAnalyticsService::class, fn () => throw new \LogicException('Unexpected reporting service'));
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->directory);
        parent::tearDown();
    }

    public function test_valid_shared_json_is_checked_without_modification_or_google_access(): void
    {
        $json = json_encode(['type' => 'service_account', 'client_email' => 'fake@example.invalid', 'private_key' => 'fake-secret', 'token_uri' => 'https://example.invalid']);
        File::put($this->directory.'/account.json', $json);
        $this->assertSame(0, Artisan::call('analytics:check-config', ['--shared' => $this->directory]));
        $this->assertStringContainsString('Google access not tested', Artisan::output());
        $this->assertSame($json, File::get($this->directory.'/account.json'));
        $this->assertSafeOutput();
    }

    public function test_missing_settings_and_file_are_reported_safely(): void
    {
        $this->assertSame(1, Artisan::call('analytics:check-config'));
        config(['services.google_analytics.property_id' => null]);
        $this->assertSame(1, Artisan::call('analytics:check-config'));
        config(['services.google_analytics.property_id' => '987654321', 'services.google_analytics.credentials_path' => null]);
        $this->assertSame(1, Artisan::call('analytics:check-config'));
        $this->assertSafeOutput();
    }

    public function test_invalid_and_incomplete_json_are_reported_safely(): void
    {
        foreach (['fake-secret invalid JSON', '{}', '{"type":"service_account"}'] as $json) {
            File::put($this->directory.'/account.json', $json);
            $this->assertSame(1, Artisan::call('analytics:check-config'));
            $this->assertSafeOutput();
        }
    }

    public function test_credentials_outside_shared_are_rejected(): void
    {
        File::put($this->directory.'/account.json', '{}');
        $this->assertSame(1, Artisan::call('analytics:check-config', ['--shared' => public_path()]));
        $this->assertStringContainsString('persist in the shared directory', Artisan::output());
        $this->assertSafeOutput();
    }

    public function test_public_and_temporary_credentials_are_rejected(): void
    {
        foreach (['storage/app/public', 'storage/framework/testing'] as $directory) {
            $path = $directory.'/analytics-test-'.bin2hex(random_bytes(8)).'.json';
            File::ensureDirectoryExists(base_path($directory));
            File::put(base_path($path), '{}');
            config(['services.google_analytics.credentials_path' => $path]);
            try {
                $this->assertSame(1, Artisan::call('analytics:check-config'));
                $this->assertStringContainsString('public or temporary directory', Artisan::output());
                $this->assertSafeOutput();
            } finally {
                File::delete(base_path($path));
            }
        }
    }

    public function test_shared_boundary_cannot_be_bypassed_with_a_sibling_directory(): void
    {
        $sibling = $this->directory.'-sibling';
        File::ensureDirectoryExists($sibling);
        File::put($sibling.'/account.json', '{}');
        config(['services.google_analytics.credentials_path' => 'storage/app/'.basename($sibling).'/account.json']);
        try {
            $this->assertSame(1, Artisan::call('analytics:check-config', ['--shared' => $this->directory]));
            $this->assertStringContainsString('persist in the shared directory', Artisan::output());
        } finally {
            File::deleteDirectory($sibling);
        }
    }

    public function test_remote_deployments_check_after_cache_and_activation_without_blocking(): void
    {
        foreach (['deploy-release.sh', 'deploy-production-release.sh'] as $script) {
            $contents = File::get(base_path('scripts/'.$script));
            $check = strpos($contents, 'if "$PHP_BIN" artisan analytics:check-config');
            $this->assertNotFalse($check);
            $this->assertLessThan($check, strpos($contents, 'artisan config:cache'));
            $this->assertLessThan($check, strpos($contents, 'ln -sfn "$RELEASE" "$CURRENT"'));
            $this->assertStringContainsString('--shared="$SHARED" --no-interaction >/dev/null 2>&1; then', $contents);
            $this->assertStringContainsString('ln -s "$SHARED/storage" storage', $contents);
            $this->assertStringNotContainsString('rm -rf storage/', $contents);
        }
    }

    private function assertSafeOutput(): void
    {
        foreach ([$this->directory, '987654321', 'fake-secret', 'fake@example.invalid'] as $secret) {
            $this->assertStringNotContainsString($secret, Artisan::output());
        }
    }
}
