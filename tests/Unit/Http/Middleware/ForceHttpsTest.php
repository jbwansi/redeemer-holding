<?php

namespace Tests\Unit\Http\Middleware;

use App\Http\Middleware\ForceHttps;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class ForceHttpsTest extends TestCase
{
    public function test_staging_http_request_is_redirected_to_https_when_forcing_is_enabled(): void
    {
        $this->app->detectEnvironment(fn (): string => 'staging');
        config(['app.force_https' => true]);

        $response = $this->handle(Request::create('http://example.test/login?next=dashboard'));

        $this->assertSame(301, $response->getStatusCode());
        $this->assertSame('https://example.test/login?next=dashboard', $response->headers->get('Location'));
    }

    public function test_staging_https_request_is_not_redirected_when_forcing_is_enabled(): void
    {
        $this->app->detectEnvironment(fn (): string => 'staging');
        config(['app.force_https' => true]);

        $response = $this->handle(Request::create('https://example.test/login'));

        $this->assertSame(204, $response->getStatusCode());
        $this->assertFalse($response->isRedirection());
    }

    public function test_http_request_is_not_redirected_when_forcing_is_disabled(): void
    {
        config(['app.force_https' => false]);

        $response = $this->handle(Request::create('http://example.test/login'));

        $this->assertSame(204, $response->getStatusCode());
        $this->assertFalse($response->isRedirection());
    }

    public function test_forwarded_https_request_is_not_redirected(): void
    {
        config(['app.force_https' => true]);
        $request = Request::create('http://example.test/login');
        $request->headers->set('X-Forwarded-Proto', 'https');

        $response = $this->handle($request);

        $this->assertSame(204, $response->getStatusCode());
        $this->assertFalse($response->isRedirection());
    }

    public function test_middleware_uses_cached_configuration_instead_of_reading_the_environment(): void
    {
        putenv('FORCE_HTTPS=false');
        config(['app.force_https' => true]);

        try {
            $response = $this->handle(Request::create('http://example.test/login'));
        } finally {
            putenv('FORCE_HTTPS');
        }

        $this->assertSame(301, $response->getStatusCode());
    }

    private function handle(Request $request): Response
    {
        $this->app['url']->setRequest($request);

        return (new ForceHttps)->handle(
            $request,
            fn (): Response => new Response(status: 204),
        );
    }
}
