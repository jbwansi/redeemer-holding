<?php

namespace Tests\Unit\Services;

use App\Services\GoogleAnalyticsService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use RuntimeException;
use Tests\TestCase;

class GoogleAnalyticsServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::clear();
    }

    public function test_analytics_values_are_read_from_laravel_configuration(): void
    {
        config([
            'services.google_analytics.property_id' => 'property-from-config',
            'services.google_analytics.credentials_path' => 'storage/app/analytics/credentials.json',
        ]);

        $service = new GoogleAnalyticsService;
        $reflection = new ReflectionClass($service);

        $this->assertSame('property-from-config', $reflection->getProperty('propertyId')->getValue($service));
        $this->assertSame(
            base_path('storage/app/analytics/credentials.json'),
            $reflection->getProperty('credentialsPath')->getValue($service),
        );
    }

    public function test_missing_property_id_is_reported_cleanly(): void
    {
        config([
            'services.google_analytics.property_id' => null,
            'services.google_analytics.credentials_path' => 'storage/app/analytics/credentials.json',
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('GA_PROPERTY_ID is missing.');

        (new GoogleAnalyticsService)->getVisitorsByDay();
    }

    public function test_missing_credentials_path_is_reported_cleanly(): void
    {
        config([
            'services.google_analytics.property_id' => '123456',
            'services.google_analytics.credentials_path' => null,
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('GA_CREDENTIALS_PATH is missing.');

        (new GoogleAnalyticsService)->getVisitorsByDay();
    }

    public function test_missing_credentials_file_is_reported_without_exposing_its_path(): void
    {
        config([
            'services.google_analytics.property_id' => '123456',
            'services.google_analytics.credentials_path' => 'storage/app/analytics/absent.json',
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Google Analytics credentials file was not found.');

        (new GoogleAnalyticsService)->getVisitorsByDay();
    }

    public function test_invalid_credentials_are_reported_as_a_google_client_failure(): void
    {
        $relativePath = 'storage/framework/testing/invalid-google-analytics-credentials.json';
        $absolutePath = base_path($relativePath);

        File::ensureDirectoryExists(dirname($absolutePath));
        File::put($absolutePath, '{}');

        config([
            'services.google_analytics.property_id' => '123456',
            'services.google_analytics.credentials_path' => $relativePath,
        ]);

        try {
            (new GoogleAnalyticsService)->getVisitorsByDay();
            $this->fail('The invalid credentials should have failed client initialization.');
        } catch (RuntimeException $e) {
            $this->assertSame('Google Analytics request failed.', $e->getMessage());
            $this->assertNotNull($e->getPrevious());
        } finally {
            File::delete($absolutePath);
        }
    }

    public function test_unreadable_credentials_are_reported_when_the_platform_supports_unix_permissions(): void
    {
        if (DIRECTORY_SEPARATOR === '\\') {
            $this->markTestSkipped('Windows does not provide a reliable chmod-based readability test.');
        }

        $relativePath = 'storage/framework/testing/unreadable-google-analytics-credentials.json';
        $absolutePath = base_path($relativePath);

        File::ensureDirectoryExists(dirname($absolutePath));
        File::put($absolutePath, '{}');
        chmod($absolutePath, 0000);

        if (is_readable($absolutePath)) {
            chmod($absolutePath, 0600);
            File::delete($absolutePath);
            $this->markTestSkipped('The current user can still read mode 000 files.');
        }

        config([
            'services.google_analytics.property_id' => '123456',
            'services.google_analytics.credentials_path' => $relativePath,
        ]);

        try {
            (new GoogleAnalyticsService)->getVisitorsByDay();
            $this->fail('The unreadable credentials should have been rejected.');
        } catch (RuntimeException $e) {
            $this->assertSame('Google Analytics credentials file is not readable.', $e->getMessage());
        } finally {
            chmod($absolutePath, 0600);
            File::delete($absolutePath);
        }
    }

    public function test_ga_environment_variables_are_not_read_outside_configuration_files(): void
    {
        foreach (File::allFiles(app_path()) as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }

            $contents = $file->getContents();

            $this->assertStringNotContainsString("env('GA_PROPERTY_ID')", $contents, $file->getPathname());
            $this->assertStringNotContainsString("env('GA_CREDENTIALS_PATH')", $contents, $file->getPathname());
        }
    }
}
