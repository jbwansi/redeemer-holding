<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingParticipant;
use App\Models\TrainingSection;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FormationRegistrationEndToEndTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
        Mail::fake();
        Notification::fake();
    }

    public function test_guest_can_create_verify_and_link_an_account_then_enter_the_lms(): void
    {
        [$training, $lesson] = $this->trainingWithLesson('parcours-invite');
        $email = 'nouveau-parcours@example.test';

        $registrationResponse = $this->post(route('trainings.register', $training->slug), [
            'first_name' => 'Nouvelle',
            'last_name' => 'Personne',
            'email' => $email,
            'phone' => '+41790000000',
            'qty' => 1,
        ]);

        $participant = TrainingParticipant::query()->sole();
        $registrationResponse->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));
        $this->assertNull($participant->user_id);
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        $this->assertNotEmpty($participant->reference);
        $this->assertDatabaseCount('training_participants', 1);

        $preservedFields = [
            'reference', 'status', 'payment_id', 'payment_amount', 'payment_date',
            'payment_confirmed', 'created_at',
        ];
        $original = collect($preservedFields)
            ->mapWithKeys(fn (string $field) => [$field => $participant->getRawOriginal($field)])
            ->all();

        $this->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/trainings/registration-confirmation')
                ->where('registration.id', $participant->id)
                ->where('registration.reference', $participant->reference)
                ->where('trainingAccess.can_access', false)
                ->where('trainingAccess.requires_account_link', true)
                ->has('trainingAccess.register_url')
                ->has('trainingAccess.login_url'));

        $this->get(route('trainings.registration.account', [
            'slug' => $training->slug,
            'participant_id' => $participant->id,
            'mode' => 'register',
        ]))->assertRedirect(route('register.page'));

        $this->get(route('register.page'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('initialMode', 'register')
                ->where('suggestedEmail', $email));

        $this->post(route('register'), [
            'first_name' => 'Nouvelle',
            'last_name' => 'Personne',
            'email' => $email,
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms' => true,
        ])->assertRedirect(route('verification.notice'));

        $user = User::query()->where('email', $email)->sole();
        $this->assertAuthenticatedAs($user);
        $this->assertNull($user->email_verified_at);
        $this->assertNull($participant->fresh()->user_id);
        $this->assertDatabaseCount('training_participants', 1);
        Notification::assertSentTo($user, VerifyEmail::class);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );
        $this->get($verificationUrl)->assertRedirect(route('training-registration.claim'));
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertNull($participant->fresh()->user_id);

        $this->get(route('training-registration.claim'))
            ->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));

        $participant->refresh();
        $this->assertSame($user->id, $participant->user_id);
        $preservedAfterLink = collect($preservedFields)
            ->mapWithKeys(fn (string $field) => [$field => $participant->getRawOriginal($field)])
            ->all();
        $this->assertSame($original, $preservedAfterLink);
        $this->assertDatabaseCount('training_participants', 1);

        $this->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainingAccess.can_access', true)
                ->where('trainingAccess.label', 'Accéder à la formation')
                ->where('trainingAccess.url', route('learning.show', $training)));

        $this->get(route('learning.show', $training))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/learning/show')
                ->where('training.id', $training->id)
                ->where('training.sections.0.lessons.0.id', $lesson->id));

        $this->get(route('learning.lesson', [$training, $lesson]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/learning/lesson')
                ->where('training.id', $training->id)
                ->where('lesson.id', $lesson->id));
        $this->assertDatabaseCount('training_participants', 1);
    }

    public function test_existing_verified_account_can_link_the_guest_registration_via_login(): void
    {
        [$training] = $this->trainingWithLesson('compte-existant');
        $user = User::factory()->create(['email' => 'existant@example.test', 'password' => 'password']);
        $participant = $this->guestParticipant($training, $user->email);

        $this->withSession(['temp_participant_' . $participant->id => true])
            ->get(route('trainings.registration.account', [
                'slug' => $training->slug,
                'participant_id' => $participant->id,
                'mode' => 'login',
            ]))->assertRedirect(route('login'));

        $this->get(route('login'))->assertInertia(fn (Assert $page) => $page
            ->where('initialMode', 'login')
            ->where('suggestedEmail', $user->email));

        $this->post(route('login.submit'), [
            'email' => $user->email,
            'password' => 'password',
            'remember' => false,
        ])->assertRedirect(route('training-registration.claim'));

        $this->get(route('training-registration.claim'))
            ->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));
        $this->assertSame($user->id, $participant->fresh()->user_id);
        $this->get(route('learning.show', $training))->assertOk();
        $this->assertDatabaseCount('training_participants', 1);
    }

    public function test_authenticated_registration_has_immediate_lms_access_without_linking(): void
    {
        [$training] = $this->trainingWithLesson('utilisateur-connecte');
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('trainings.register', $training->slug), [
            'first_name' => 'Client',
            'last_name' => 'Connecté',
            'email' => $user->email,
            'phone' => null,
            'qty' => 1,
        ]);

        $participant = TrainingParticipant::query()->sole();
        $this->assertSame($user->id, $participant->user_id);
        $this->assertNull(session('training_registration_link'));
        $this->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainingAccess.can_access', true)
                ->where('trainingAccess.label', 'Accéder à la formation'));
    }

    private function trainingWithLesson(string $slug): array
    {
        $training = Training::query()->create([
            'title' => 'Formation E2E ' . $slug,
            'slug' => 'formation-e2e-' . $slug,
            'excerpt' => 'Validation E2E',
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->addWeek(),
            'end_date' => now()->addWeek()->addHour(),
            'price' => 0,
            'max_participants' => 10,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
        $section = TrainingSection::query()->create([
            'training_id' => $training->id,
            'title' => 'Première section',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        $lesson = TrainingLesson::query()->create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'Première leçon',
            'slug' => 'premiere-lecon-' . $slug,
            'sort_order' => 1,
            'is_published' => true,
        ]);

        return [$training, $lesson];
    }

    private function guestParticipant(Training $training, string $email): TrainingParticipant
    {
        return TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Participant existant',
            'email' => $email,
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
    }
}
