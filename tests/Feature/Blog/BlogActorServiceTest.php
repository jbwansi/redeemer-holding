<?php

namespace Tests\Feature\Blog;

use App\Models\User;
use App\Services\Blog\BlogActorService;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tests\TestCase;

class BlogActorServiceTest extends TestCase
{
    use RefreshDatabase;

    private function request(?string $token = null): Request
    {
        return Request::create('https://example.test/blogs/article', 'GET', [],
            $token === null ? [] : [config('blog.anonymous_cookie') => $token]);
    }

    public function test_anonymous_identity_is_explicit_random_hashed_and_not_based_on_ip(): void
    {
        $service = app(BlogActorService::class);
        $this->assertNull($service->resolve($this->request()));
        $this->assertDatabaseCount('blog_actors', 0);
        $first = $service->initialize($this->request());
        $second = $service->initialize($this->request());
        $token = $first['cookie']->getValue();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $token);
        $this->assertNotSame($first['actor']->id, $second['actor']->id);
        $this->assertSame(hash('sha256', $token), $first['actor']->token_hash);
        $request = $this->request($token);
        $request->server->set('REMOTE_ADDR', '192.0.2.99');
        $again = $service->initialize($request);
        $this->assertTrue($first['actor']->is($again['actor']));
        $this->assertNull($again['cookie']);
        foreach (['id', 'user_id', 'token_hash', 'expires_at', 'kind'] as $key) {
            $this->assertArrayNotHasKey($key, $first['actor']->toArray());
        }
    }

    public function test_cookie_is_encrypted_authenticated_and_has_security_attributes(): void
    {
        $service = app(BlogActorService::class);
        $middleware = app(EncryptCookies::class);
        $initialized = $service->initialize($this->request());
        $cookie = $initialized['cookie'];
        $this->assertTrue($cookie->isSecure());
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
        $this->assertSame('/blogs', $cookie->getPath());
        $this->assertNull($cookie->getDomain());
        $response = $middleware->handle($this->request(), function () use ($cookie) {
            $response = new Response;
            $response->headers->setCookie($cookie);

            return $response;
        });
        $encrypted = $response->headers->getCookies()[0]->getValue();
        $this->assertNotSame($cookie->getValue(), $encrypted);
        $middleware->handle($this->request($encrypted), function ($request) use ($service, $initialized) {
            $this->assertTrue($initialized['actor']->is($service->resolve($request)));

            return new Response;
        });
        foreach ([$encrypted.'tampered', $cookie->getValue()] as $invalid) {
            $middleware->handle($this->request($invalid), function ($request) use ($service) {
                $this->assertNull($service->resolve($request));

                return new Response;
            });
        }
    }

    public function test_fixed_expiration_and_revocation_prevent_cookie_replay(): void
    {
        config(['blog.anonymous_lifetime_minutes' => 60]);
        $service = app(BlogActorService::class);
        $identity = $service->initialize($this->request());
        $request = $this->request($identity['cookie']->getValue());
        $this->travel(59)->minutes();
        $this->assertNotNull($service->resolve($request));
        $this->travel(1)->minutes();
        $this->assertNull($service->resolve($request));
        $replacement = $service->initialize($request);
        $this->assertFalse($identity['actor']->is($replacement['actor']));
        $service->revokeAnonymous($replacement['actor']);
        $this->assertNull($service->resolve($this->request($replacement['cookie']->getValue())));
        $this->assertDatabaseCount('blog_actors', 2);
    }

    public function test_login_does_not_claim_anonymous_identity_and_logout_resumes_it(): void
    {
        $service = app(BlogActorService::class);
        $identity = $service->initialize($this->request());
        $request = $this->request($identity['cookie']->getValue());
        $user = User::factory()->create(['is_active' => true]);
        $request->setUserResolver(fn () => $user);
        $account = $service->initialize($request);
        $this->assertSame($user->id, $account['actor']->user_id);
        $this->assertFalse($identity['actor']->is($account['actor']));
        $this->assertNull($account['cookie']);
        $this->assertTrue($account['actor']->is($service->resolve($request)));
        $this->assertNull($identity['actor']->refresh()->user_id);
        $request->setUserResolver(fn () => null);
        $this->assertTrue($identity['actor']->is($service->resolve($request)));
        $user->delete();
        $this->assertSame('user', $account['actor']->refresh()->kind);
        $this->assertNull($account['actor']->user_id);
        $this->assertNull($account['actor']->token_hash);
    }

    public function test_inactive_user_cannot_fall_back_to_anonymous_identity(): void
    {
        $service = app(BlogActorService::class);
        $identity = $service->initialize($this->request());
        $request = $this->request($identity['cookie']->getValue());
        $request->setUserResolver(fn () => User::factory()->create(['is_active' => false]));
        $this->expectException(AccessDeniedHttpException::class);
        $service->initialize($request);
    }

    public function test_unknown_token_does_not_create_an_actor_and_production_forces_secure_cookie(): void
    {
        $service = app(BlogActorService::class);
        $this->assertNull($service->resolve($this->request(str_repeat('a', 64))));
        $this->assertDatabaseCount('blog_actors', 0);
        $this->app->instance('env', 'production');
        $cookie = $service->initialize(Request::create('http://example.test/blogs/article'))['cookie'];
        $this->assertTrue($cookie->isSecure());
    }

    public function test_staging_cookie_is_secure_even_when_tls_terminates_at_a_proxy(): void
    {
        $this->app->instance('env', 'staging');
        $request = Request::create('http://example.test/blogs/article');
        $request->headers->set('X-Forwarded-Proto', 'https');
        $this->assertFalse($request->isSecure());
        $identity = app(BlogActorService::class)->initialize($request);
        $this->assertTrue($identity['cookie']->isSecure());
        $this->assertTrue($identity['cookie']->isHttpOnly());
        $this->assertSame('lax', $identity['cookie']->getSameSite());
        $this->assertSame('/blogs', $identity['cookie']->getPath());
    }
}
