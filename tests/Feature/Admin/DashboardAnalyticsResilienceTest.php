<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\GoogleAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class DashboardAnalyticsResilienceTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('failingAnalyticsMethods')]
    public function test_dashboard_uses_empty_fallbacks_when_any_analytics_call_fails(string $failingMethod): void
    {
        $analytics = Mockery::mock(GoogleAnalyticsService::class);

        foreach (['getVisitorsByCountry', 'getVisitorsByDay', 'getTopPages', 'getTrafficSources'] as $method) {
            $expectation = $analytics->shouldReceive($method)->zeroOrMoreTimes();

            if ($method === $failingMethod) {
                $expectation->andThrow(new RuntimeException('Analytics unavailable'));
            } else {
                $expectation->andReturn([['name' => $method, 'value' => 1]]);
            }
        }

        $this->app->instance(GoogleAnalyticsService::class, $analytics);

        $this->assertDashboardUsesAnalyticsFallbacks();
    }

    #[DataProvider('invalidAnalyticsConfigurations')]
    public function test_authenticated_admin_dashboard_survives_invalid_analytics_configuration(array $configuration): void
    {
        config($configuration);

        $this->assertDashboardUsesAnalyticsFallbacks();
    }

    public static function failingAnalyticsMethods(): array
    {
        return [
            'country' => ['getVisitorsByCountry'],
            'day' => ['getVisitorsByDay'],
            'pages' => ['getTopPages'],
            'sources' => ['getTrafficSources'],
        ];
    }

    public static function invalidAnalyticsConfigurations(): array
    {
        return [
            'missing property id' => [[
                'services.google_analytics.property_id' => null,
                'services.google_analytics.credentials_path' => 'storage/app/analytics/credentials.json',
            ]],
            'missing credentials path' => [[
                'services.google_analytics.property_id' => '123456',
                'services.google_analytics.credentials_path' => null,
            ]],
            'missing credentials file' => [[
                'services.google_analytics.property_id' => '123456',
                'services.google_analytics.credentials_path' => 'storage/app/analytics/absent.json',
            ]],
        ];
    }

    private function assertDashboardUsesAnalyticsFallbacks(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('backend/index', false)
                ->where('visitorsByCountry', [])
                ->where('visitorsByDay', [])
                ->where('topPages', [])
                ->where('trafficSources', [])
                ->where('gaError', 'Google Analytics est temporairement indisponible.'));
    }
}
