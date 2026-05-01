<?php

namespace App\Services;

use Google\Analytics\Data\V1beta\Client\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\RunReportRequest;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class GoogleAnalyticsService
{
    protected string $propertyId;
    protected string $credentialsPath;

    public function __construct()
    {
        $this->propertyId = (string) env('GA_PROPERTY_ID');
        $this->credentialsPath = base_path((string) env('GA_CREDENTIALS_PATH'));
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
        if (! file_exists($this->credentialsPath)) {
            throw new RuntimeException('Credentials file not found: ' . $this->credentialsPath);
        }

        if (empty($this->propertyId)) {
            throw new RuntimeException('GA_PROPERTY_ID is missing.');
        }

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