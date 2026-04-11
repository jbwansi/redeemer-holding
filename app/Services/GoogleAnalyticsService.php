<?php

namespace App\Services;

use Google\Analytics\Data\V1beta\Client\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\RunReportRequest;
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
        if (! file_exists($this->credentialsPath)) {
            throw new RuntimeException('Credentials file not found: ' . $this->credentialsPath);
        }

        if (empty($this->propertyId)) {
            throw new RuntimeException('GA_PROPERTY_ID is missing.');
        }

        $client = new BetaAnalyticsDataClient([
            'credentials' => $this->credentialsPath,
        ]);

        // Wrap your parameters in a RunReportRequest object
        $request = new RunReportRequest([
            'property' => 'properties/' . $this->propertyId,
            'date_ranges' => [
                new DateRange([
                    'start_date' => '30daysAgo',
                    'end_date' => 'today',
                ]),
            ],
            'dimensions' => [
                new Dimension(['name' => 'country']),
            ],
            'metrics' => [
                new Metric(['name' => 'activeUsers']),
            ],
        ]);

        $response = $client->runReport($request);

        $data = [];

        foreach ($response->getRows() as $row) {
            $data[] = [
                'country' => $row->getDimensionValues()[0]->getValue(),
                'users' => (int) $row->getMetricValues()[0]->getValue(),
            ];
        }

        return $data;
    }
}