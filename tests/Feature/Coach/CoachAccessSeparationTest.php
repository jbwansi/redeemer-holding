<?php

namespace Tests\Feature\Coach;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CoachAccessSeparationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_admin_can_access_existing_admin_coach_section(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/coach')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('backend/coach/index', false)
                ->has('settings')
                ->has('metrics'));
    }

    public function test_active_client_can_access_coach_without_professional_profile(): void
    {
        $client = User::factory()->create();

        $this->assertNull($client->professionalProfile);
        $this->actingAs($client)->get('/dashboard-client/coach')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/Coach/Dashboard')
                ->where('profileComplete', false));
    }

    public function test_client_receives_403_from_admin_coach_section(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client)->get('/admin/coach')->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_from_client_coach(): void
    {
        $this->get('/dashboard-client/coach')->assertRedirect(route('login'));
    }

    public function test_legacy_coach_url_is_not_exposed(): void
    {
        $this->get('/coach')->assertNotFound();
    }

    public function test_admin_metrics_do_not_expose_private_coach_records(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/coach')
            ->assertInertia(fn (Assert $page) => $page
                ->missing('documents')
                ->missing('conversations')
                ->missing('profiles')
                ->missing('messages'));
    }

    public function test_admin_can_update_coach_configuration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->put(route('admin.coach.settings.update'), [
            'enabled' => true,
            'module_interview' => true,
            'module_cv' => false,
            'module_career' => false,
            'module_certification' => false,
            'provider' => 'fake',
            'languages' => ['fr', 'en'],
            'default_language' => 'fr',
            'monthly_message_limit' => 250,
            'rate_limit_per_minute' => 15,
            'general_instructions' => 'Configuration générale.',
            'interview_question_limit' => 5,
        ])->assertRedirect();

        $this->assertSame('250', Setting::where('type', 'coach_monthly_message_limit')->value('value'));
        $this->assertSame('1', Setting::where('type', 'coach_module_interview')->value('value'));
    }
}
