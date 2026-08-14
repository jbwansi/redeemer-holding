<?php

namespace App\Services;

use Google\Analytics\Data\V1beta\Client\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\RunReportRequest;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

class GoogleAnalyticsService
{
    protected string $propertyId;
    protected string $credentialsPath;

    public function __construct()
    {
        $this->propertyId = (string) config('services.google_analytics.property_id', '');

        $credentialsPath = (string) config('services.google_analytics.credentials_path', '');
        $this->credentialsPath = $credentialsPath === '' ? '' : base_path($credentialsPath);
    }

    public function getVisitorsByCountry(): array
    {
        return Cache::remember('ga_visitors_country', 3600, function () {
            return $this->runReport('country', 'activeUsers');
        });
    }

    public function getVisitorsByDay(): array
    {
        return Cache::remember('ga_visitors_day', 3600, function () {
            return $this->runReport('date', 'activeUsers');
        });
    }

    public function getTopPages(): array
    {
        return Cache::remember('ga_top_pages', 3600, function () {
            return $this->runReport('pageTitle', 'screenPageViews');
        });
    }

    public function getTrafficSources(): array
    {
        return Cache::remember('ga_traffic_sources', 3600, function () {
            return $this->runReport('sessionSource', 'sessions');
        });
    }

    private function runReport(string $dimension, string $metric): array
    {
        if (empty($this->propertyId)) {
            throw new RuntimeException('GA_PROPERTY_ID is missing.');
        }

        if ($this->credentialsPath === '') {
            throw new RuntimeException('GA_CREDENTIALS_PATH is missing.');
        }

        if (! is_file($this->credentialsPath)) {
            throw new RuntimeException('Google Analytics credentials file was not found.');
        }

        if (! is_readable($this->credentialsPath)) {
            throw new RuntimeException('Google Analytics credentials file is not readable.');
        }

        try {
            $client = new BetaAnalyticsDataClient([
                'credentials' => $this->credentialsPath,
            ]);

            $request = new RunReportRequest([
                'property' => 'properties/' . $this->propertyId,
                'date_ranges' => [
                    new DateRange([
                        'start_date' => '30daysAgo',
                        'end_date' => 'today',
                    ]),
                ],
                'dimensions' => [
                    new Dimension(['name' => $dimension]),
                ],
                'metrics' => [
                    new Metric(['name' => $metric]),
                ],
                'limit' => 10,
            ]);

            $response = $client->runReport($request);
        } catch (Throwable $e) {
            throw new RuntimeException('Google Analytics request failed.', previous: $e);
        }

        $data = [];

        foreach ($response->getRows() as $row) {
            $data[] = [
                'name' => $row->getDimensionValues()[0]->getValue(),
                'value' => (int) $row->getMetricValues()[0]->getValue(),
            ];
        }

        return $data;
    }
}
