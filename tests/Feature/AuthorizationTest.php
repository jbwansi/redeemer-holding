<?php

namespace Tests\Feature;

use App\Http\Middleware\RequireAdminAccess;
use App\Models\Training;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware(RequireAdminAccess::class)
            ->get('/_test/admin-authorization', fn () => response()->json(['ok' => true]));
    }

    public function test_administrator_can_access_an_admin_route(): void
    {
        $admin = new User(['role' => 'admin']);
        $admin->id = 1;

        $this->actingAs($admin)
            ->get('/_test/admin-authorization')
            ->assertOk();
    }

    public function test_normal_user_receives_403_from_admin_route(): void
    {
        $client = new User(['role' => 'client']);
        $client->id = 2;

        $this->actingAs($client)
            ->get('/_test/admin-authorization')
            ->assertForbidden();
    }

    public function test_admin_gate_is_the_source_of_frontend_capability(): void
    {
        $admin = new User(['role' => 'admin']);
        $client = new User(['role' => 'client']);

        $this->assertTrue(Gate::forUser($admin)->allows('administer'));
        $this->assertFalse(Gate::forUser($client)->allows('administer'));
    }

    public function test_admin_can_access_learning_through_training_policy(): void
    {
        $admin = new User(['role' => 'admin']);
        $training = new Training(['is_published' => false]);

        $this->assertTrue(Gate::forUser($admin)->allows('viewLearning', $training));
    }

    public function test_normal_user_cannot_access_unpublished_learning_content(): void
    {
        $client = new User(['role' => 'client']);
        $training = new Training(['is_published' => false]);

        $this->assertFalse(Gate::forUser($client)->allows('viewLearning', $training));
    }
}
