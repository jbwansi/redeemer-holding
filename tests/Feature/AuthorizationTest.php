<?php

namespace Tests\Feature;

use App\Http\Middleware\RequireAdminAccess;
use App\Models\EventParticipant;
use App\Models\ServiceRequest;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use App\Services\OwnedResourceAccessService;
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

        Route::middleware(RequireAdminAccess::class)
            ->post('/_test/admin-content', fn () => response()->json(['ok' => true]));

        Route::middleware(RequireAdminAccess::class)
            ->delete('/_test/admin-content/{content}', fn () => response()->json(['ok' => true]));

        Route::delete('/_test/participants/{participant}', function (int $participant) {
            $registration = new EventParticipant(['user_id' => 100]);
            $registration->id = $participant;
            Gate::authorize('update', $registration);

            return response()->json(['ok' => true]);
        });

        Route::get('/_test/guest-participants/{participant}', function (int $participant) {
            $registration = new EventParticipant();
            $registration->id = $participant;
            app(OwnedResourceAccessService::class)->authorize($registration);

            return response()->json(['ok' => true]);
        });
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

    public function test_guest_is_redirected_from_protected_route(): void
    {
        $this->get('/_test/admin-authorization')
            ->assertRedirect(route('login'));
    }

    public function test_normal_user_cannot_bypass_frontend_to_mutate_admin_content(): void
    {
        $client = new User(['role' => 'client']);
        $client->id = 2;

        $this->actingAs($client)->post('/_test/admin-content')->assertForbidden();
        $this->actingAs($client)->delete('/_test/admin-content/1')->assertForbidden();
    }

    public function test_normal_user_cannot_mutate_another_users_registration(): void
    {
        $client = new User(['role' => 'client']);
        $client->id = 2;

        $this->actingAs($client)
            ->delete('/_test/participants/10')
            ->assertForbidden();
    }

    public function test_guest_access_uses_the_centralized_ownership_session_key(): void
    {
        $this->get('/_test/guest-participants/10')->assertForbidden();

        $this->withSession(['temp_participant_10' => true])
            ->get('/_test/guest-participants/10')
            ->assertOk();
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

    public function test_ownership_policies_allow_only_owner_or_admin(): void
    {
        $owner = new User(['role' => 'client']);
        $owner->id = 10;
        $otherUser = new User(['role' => 'client']);
        $otherUser->id = 20;
        $admin = new User(['role' => 'admin']);
        $admin->id = 30;

        foreach ([
            new EventParticipant(['user_id' => 10]),
            new TrainingParticipant(['user_id' => 10]),
            new ServiceRequest(['user_id' => 10]),
        ] as $resource) {
            $this->assertTrue(Gate::forUser($owner)->allows('view', $resource));
            $this->assertFalse(Gate::forUser($otherUser)->allows('view', $resource));
            $this->assertTrue(Gate::forUser($admin)->allows('update', $resource));
        }
    }
}
