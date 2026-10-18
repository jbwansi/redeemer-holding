<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Throwable;

class CheckAnalyticsConfiguration extends Command
{
    protected $signature = 'analytics:check-config {--shared= : Deployment shared directory}';

    protected $description = 'Check local Analytics configuration without contacting Google';

    public function handle(): int
    {
        try {
            $property = (string) config('services.google_analytics.property_id', '');
            $path = (string) config('services.google_analytics.credentials_path', '');

            if (! preg_match('/^[0-9]+$/D', $property) || $path === '') {
                return $this->invalid('GA_PROPERTY_ID or GA_CREDENTIALS_PATH is missing or invalid.');
            }

            // Match the path resolution used by GoogleAnalyticsService.
            $path = base_path($path);
            if (! is_file($path) || ! is_readable($path)) {
                return $this->invalid('Analytics credentials file is missing or unreadable.');
            }

            $resolved = realpath($path);
            if ($this->option('shared') !== null) {
                $shared = realpath($this->option('shared'));
                if ($shared === false || ! $this->within($resolved, $shared)) {
                    return $this->invalid('Analytics credentials must persist in the shared directory.');
                }
            }

            foreach ([public_path(), storage_path('app/public'), storage_path('framework')] as $unsafe) {
                $directory = realpath($unsafe);
                if ($directory !== false && $this->within($resolved, $directory)) {
                    return $this->invalid('Analytics credentials are in a public or temporary directory.');
                }
            }

            $credentials = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
            if (! is_array($credentials) || ($credentials['type'] ?? null) !== 'service_account') {
                return $this->invalid('Analytics credentials must be a service account JSON.');
            }
            foreach (['client_email', 'private_key', 'token_uri'] as $field) {
                if (! is_string($credentials[$field] ?? null) || trim($credentials[$field]) === '') {
                    return $this->invalid('Analytics service account JSON is incomplete.');
                }
            }
        } catch (Throwable) {
            // Never print exception messages: they may include paths or JSON contents.
            return $this->invalid('Analytics local configuration could not be validated.');
        }

        $this->info('Analytics local configuration OK (Google access not tested).');

        return self::SUCCESS;
    }

    private function within(string $path, string $directory): bool
    {
        return str_starts_with($path, rtrim($directory, '/\\').DIRECTORY_SEPARATOR);
    }

    private function invalid(string $message): int
    {
        $this->warn($message);

        return self::FAILURE;
    }
}
