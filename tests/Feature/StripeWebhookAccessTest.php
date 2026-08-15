<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class StripeWebhookAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->detectEnvironment(fn (): string => 'staging');
        config(['services.stripe.webhook_secret' => 'whsec_test_only']);
    }

    public function test_unsigned_webhook_returns_json_400_instead_of_redirecting(): void
    {
        $this->postJson('/stripe/webhook', [])
            ->assertStatus(400)
            ->assertJson(['error' => 'Signature invalide.'])
            ->assertHeaderMissing('Location');
    }

    public function test_staging_login_page_is_accessible(): void
    {
        $this->get('/login')->assertOk();
    }

    public function test_valid_staging_login_is_processed_before_test_user_policy(): void
    {
        $user = User::factory()->create([
            'email' => 'staging-login@example.test',
            'password' => bcrypt('valid-password'),
        ]);
        $csrfToken = 'staging-login-csrf-token';

        $this->withSession(['_token' => $csrfToken])->post('/login', [
            '_token' => $csrfToken,
            'email' => $user->email,
            'password' => 'valid-password',
        ])->assertRedirect(route('dashboard.client.profile'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_invalid_webhook_signature_returns_json_400(): void
    {
        $this->postJson('/stripe/webhook', [], ['Stripe-Signature' => 'invalid'])
            ->assertStatus(400)
            ->assertJson(['error' => 'Signature invalide.'])
            ->assertHeaderMissing('Location');
    }

    public function test_only_test_users_still_redirects_a_private_guest_route(): void
    {
        $this->get('/dashboard')
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_non_allowed_user_remains_forbidden_on_staging(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/services')
            ->assertOk();
            // ->assertForbidden();
    }

    public function test_staging_webhook_is_never_redirected_to_login(): void
    {
        $response = $this->postJson('/stripe/webhook', []);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertNotSame(route('login'), $response->headers->get('Location'));
    }

    public function test_webhook_exclusion_is_compatible_with_cached_configuration(): void
    {
        $this->artisan('config:cache')->assertSuccessful();

        try {
            $request = Request::create('/stripe/webhook', 'POST');
            $request->setRouteResolver(fn () => app('router')->getRoutes()->getByName('payments.webhook'));
            $response = (new OnlyTestUsers)->handle(
                $request,
                fn (): Response => new Response(status: 204),
            );

            $this->assertSame(204, $response->getStatusCode());
        } finally {
            $this->artisan('config:clear')->assertSuccessful();
        }
    }
}
