<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthModeFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_login_route_explicitly_opens_login_mode(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/auth')
                ->where('initialMode', 'login')
                ->where('suggestedEmail', null));
    }

    public function test_registration_route_explicitly_opens_registration_mode(): void
    {
        $this->get(route('register.page'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/auth')
                ->where('initialMode', 'register')
                ->where('suggestedEmail', null));
    }

    public function test_auth_tabs_keep_the_pending_link_and_prefilled_email(): void
    {
        [$training, $participant] = $this->guestRegistration();

        $this->withSession(['temp_participant_' . $participant->id => true])
            ->get(route('trainings.registration.account', [
                'slug' => $training->slug,
                'participant_id' => $participant->id,
                'mode' => 'login',
            ]))
            ->assertRedirect(route('login'));

        $this->get(route('login'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('initialMode', 'login')
                ->where('suggestedEmail', $participant->email));

        $this->get(route('register.page'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('initialMode', 'register')
                ->where('suggestedEmail', $participant->email));

        $this->get(route('login'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('initialMode', 'login')
                ->where('suggestedEmail', $participant->email));
    }

    public function test_normal_login_still_authenticates_without_a_link_intent(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->post(route('login.submit'), [
            'email' => $user->email,
            'password' => 'password',
            'remember' => false,
        ])->assertRedirect(route('dashboard.client.profile'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_normal_registration_still_creates_and_authenticates_an_account(): void
    {
        Mail::fake();
        Notification::fake();

        $this->post(route('register'), [
            'first_name' => 'Nouvelle',
            'last_name' => 'Personne',
            'email' => 'nouvelle@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms' => true,
        ])->assertRedirect(route('dashboard.client.profile'));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'nouvelle@example.test']);
    }

    private function guestRegistration(): array
    {
        $training = Training::query()->create([
            'title' => 'Formation rattachement auth',
            'slug' => 'formation-rattachement-auth',
            'excerpt' => 'Test',
            'content' => 'Test',
            'location' => 'En ligne',
            'start_date' => now()->addWeek(),
            'end_date' => now()->addWeek()->addHour(),
            'price' => 0,
            'max_participants' => 10,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Visiteur Test',
            'email' => 'visiteur@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);

        return [$training, $participant];
    }
}
