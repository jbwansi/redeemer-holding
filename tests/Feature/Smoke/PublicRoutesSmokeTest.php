<?php

namespace Tests\Feature\Smoke;

use App\Http\Middleware\OnlyTestUsers;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicRoutesSmokeTest extends TestCase
{
    public function test_health_route_checks_the_application_and_database(): void
    {
        $this->get('/up')->assertOk()->assertSee('Application up');
    }

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([OnlyTestUsers::class]);
    }

    public function test_public_routes_respond_successfully(): void
    {
        $routes = [
            '/',
            '/contact',
            '/faq',
            '/about-me',
            '/services',
            '/formations',
            '/blogs',
            '/evenements',
            '/login',
            '/inscription',
            '/password/request',
            '/termes-et-conditions',
            '/politique-de-confidentialite',
            '/politique-des-cookies',
        ];

        foreach ($routes as $uri) {
            $this->get($uri)->assertOk();
        }
    }

    public function test_dashboard_route_redirects_guest_to_login(): void
    {
        $this->get('/dashboard')->assertStatus(302);
    }
}
