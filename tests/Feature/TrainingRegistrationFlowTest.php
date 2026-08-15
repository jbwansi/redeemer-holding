<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingLesson;
use App\Models\TrainingProgress;
use App\Models\TrainingSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TrainingRegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_authenticated_user_can_register_for_a_free_training(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $training = $this->training();

        $response = $this->actingAs($user)->post(
            route('trainings.register', $training->slug),
            $this->registrationData($user)
        );

        $participant = TrainingParticipant::query()->sole();
        $response->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));
        $this->assertDatabaseHas('training_participants', [
            'training_id' => $training->id,
            'user_id' => $user->id,
            'status' => TrainingParticipant::STATUS_COMPLETED,
        ]);

        $this->actingAs($user)
            ->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/trainings/registration-confirmation')
                ->where('training.id', $training->id)
                ->where('training.title', $training->title)
                ->where('registration.id', $participant->id)
                ->where('registration.status', TrainingParticipant::STATUS_COMPLETED)
                ->where('trainingAccess.can_access', true)
                ->where('trainingAccess.label', 'Accéder à la formation')
                ->where('trainingAccess.url', route('learning.show', $training)));
    }

    public function test_existing_registration_is_returned_after_a_page_refresh(): void
    {
        [$user, $training, $participant] = $this->completedRegistration();

        $this->actingAs($user)
            ->get(route('formations.details', $training->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/trainings/show')
                ->where('participant.id', $participant->id)
                ->where('participant.status', TrainingParticipant::STATUS_COMPLETED)
                ->where('trainingAccess.can_access', true)
                ->where('trainingAccess.label', 'Accéder à la formation'));
    }

    public function test_existing_user_registration_cannot_be_duplicated(): void
    {
        [$user, $training] = $this->completedRegistration();

        $this->actingAs($user)
            ->from(route('formations.details', $training->slug))
            ->post(route('trainings.register', $training->slug), $this->registrationData($user))
            ->assertRedirect(route('formations.details', $training->slug))
            ->assertSessionHasErrors('general');

        $this->assertDatabaseCount('training_participants', 1);
    }

    public function test_repeated_guest_submission_cannot_create_a_duplicate(): void
    {
        $training = $this->training();
        $payload = [
            'first_name' => 'Visiteur',
            'last_name' => 'Unique',
            'email' => 'visiteur-unique@example.test',
            'phone' => null,
            'qty' => 1,
        ];

        $this->post(route('trainings.register', $training->slug), $payload)->assertRedirect();
        $this->post(route('trainings.register', $training->slug), $payload)
            ->assertSessionHasErrors('general');

        $this->assertDatabaseCount('training_participants', 1);
    }

    public function test_guest_registration_remains_supported_without_granting_lms_access(): void
    {
        $training = $this->training();
        $response = $this->post(route('trainings.register', $training->slug), [
            'first_name' => 'Visiteur', 'last_name' => 'Test',
            'email' => 'visiteur@example.test', 'phone' => null, 'qty' => 1,
        ]);

        $participant = TrainingParticipant::query()->sole();
        $response->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));
        $this->assertNull($participant->user_id);
        $this->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainingAccess.can_access', false)
                ->where('trainingAccess.requires_account_link', true)
                ->where('trainingAccess.register_url', route('trainings.registration.account', [
                    'slug' => $training->slug,
                    'participant_id' => $participant->id,
                    'mode' => 'register',
                ]))
                ->where('trainingAccess.login_url', route('trainings.registration.account', [
                    'slug' => $training->slug,
                    'participant_id' => $participant->id,
                    'mode' => 'login',
                ]))
                ->missing('trainingAccess.url')
                ->missing('trainingAccess.label'));
        $this->get(route('learning.show', $training))->assertRedirect(route('login'));
    }

    public function test_verified_account_can_claim_the_existing_guest_registration(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'user_id' => null,
            'training_id' => $training->id,
            'name' => 'Visiteur Test',
            'email' => 'visiteur@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
        $user = User::factory()->create([
            'email' => 'VISITEUR@example.test',
            'email_verified_at' => now(),
        ]);

        $this->withSession(['temp_participant_' . $participant->id => true])
            ->get(route('trainings.registration.account', [
                'slug' => $training->slug,
                'participant_id' => $participant->id,
                'mode' => 'login',
            ]))
            ->assertRedirect(route('login'));

        $this->actingAs($user)
            ->get(route('training-registration.claim'))
            ->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'user_id' => $user->id,
            'reference' => $participant->reference,
            'status' => TrainingParticipant::STATUS_COMPLETED,
        ]);

        $this->actingAs($user)
            ->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainingAccess.can_access', true)
                ->where('trainingAccess.requires_account_link', false)
                ->where('trainingAccess.url', route('learning.show', $training)));
    }

    public function test_unverified_account_cannot_claim_a_guest_registration(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Visiteur Test',
            'email' => 'visiteur@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
        $user = User::factory()->unverified()->create(['email' => $participant->email]);

        $this->actingAs($user)
            ->withSession([
                'training_registration_link' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'expires_at' => now()->addHour()->timestamp,
                ],
            ])
            ->get(route('training-registration.claim'))
            ->assertRedirect(route('verification.notice'));

        $this->assertNull($participant->fresh()->user_id);
    }

    public function test_email_verification_completes_the_pending_registration_link(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Visiteur Test',
            'email' => 'visiteur@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
        $user = User::factory()->unverified()->create(['email' => $participant->email]);
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->actingAs($user)
            ->withSession([
                'training_registration_link' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'expires_at' => now()->addHour()->timestamp,
                ],
            ])
            ->get($verificationUrl)
            ->assertRedirect(route('training-registration.claim'));

        $this->assertNotNull($user->fresh()->email_verified_at);

        $this->get(route('training-registration.claim'))
            ->assertRedirect(route('trainings.registration.confirmation', [$training->slug, $participant->id]));
        $this->assertSame($user->id, $participant->fresh()->user_id);
    }

    public function test_verified_account_with_a_different_email_cannot_claim_registration(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Propriétaire',
            'email' => 'proprietaire@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
        $user = User::factory()->create(['email' => 'intrus@example.test']);

        $this->actingAs($user)
            ->withSession([
                'training_registration_link' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'expires_at' => now()->addHour()->timestamp,
                ],
            ])
            ->get(route('training-registration.claim'))
            ->assertSessionHasErrors('email');

        $this->assertNull($participant->fresh()->user_id);
    }

    public function test_registration_already_owned_by_another_user_cannot_be_claimed(): void
    {
        $training = $this->training();
        $owner = User::factory()->create();
        $intruder = User::factory()->create(['email' => $owner->email . '.intrus']);
        $participant = TrainingParticipant::query()->create([
            'user_id' => $owner->id,
            'training_id' => $training->id,
            'name' => $owner->name,
            'email' => $owner->email,
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);

        $this->actingAs($intruder)
            ->withSession([
                'training_registration_link' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'expires_at' => now()->addHour()->timestamp,
                ],
            ])
            ->get(route('training-registration.claim'))
            ->assertForbidden();

        $this->assertSame($owner->id, $participant->fresh()->user_id);
    }

    public function test_account_link_start_requires_the_original_guest_session(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Visiteur Test',
            'email' => 'visiteur@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);

        $this->get(route('trainings.registration.account', [
            'slug' => $training->slug,
            'participant_id' => $participant->id,
        ]))->assertForbidden();
    }

    public function test_cancelled_registration_cannot_be_claimed_from_an_existing_intent(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Visiteur annulé',
            'email' => 'annule@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_CANCELLED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
        $user = User::factory()->create(['email' => $participant->email]);

        $this->actingAs($user)
            ->withSession([
                'training_registration_link' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'expires_at' => now()->addHour()->timestamp,
                ],
            ])
            ->get(route('training-registration.claim'))
            ->assertSessionHasErrors('registration');

        $this->assertNull($participant->fresh()->user_id);
    }

    public function test_expired_registration_link_intent_cannot_be_claimed(): void
    {
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Visiteur expiré',
            'email' => 'expire@example.test',
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);
        $user = User::factory()->create(['email' => $participant->email]);

        $this->actingAs($user)
            ->withSession([
                'training_registration_link' => [
                    'participant_id' => $participant->id,
                    'training_id' => $training->id,
                    'expires_at' => now()->subMinute()->timestamp,
                ],
            ])
            ->get(route('training-registration.claim'))
            ->assertRedirect(route('formations'));

        $this->assertNull($participant->fresh()->user_id);
    }

    public function test_confirmation_exposes_continue_action_when_progress_exists(): void
    {
        [$user, $training, $participant] = $this->completedRegistration();
        $section = TrainingSection::query()->create([
            'training_id' => $training->id,
            'title' => 'Module test',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        $lesson = TrainingLesson::query()->create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'Leçon test',
            'slug' => 'lesson-confirmation-' . uniqid(),
            'sort_order' => 1,
            'is_published' => true,
        ]);
        TrainingProgress::query()->create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'training_lesson_id' => $lesson->id,
            'completed' => false,
        ]);

        $this->actingAs($user)
            ->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainingAccess.can_access', true)
                ->where('trainingAccess.label', 'Continuer la formation')
                ->where('trainingAccess.url', route('learning.show', $training)));
    }

    public function test_paid_pending_registration_has_no_lms_access_on_confirmation(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $training = $this->training();
        $training->update(['price' => 120]);
        $participant = TrainingParticipant::query()->create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'name' => $user->name,
            'email' => $user->email,
            'qty' => 1,
            'status' => TrainingParticipant::STATUS_PENDING,
            'reference' => TrainingParticipant::generateReference(),
            'payment_confirmed' => false,
        ]);

        $this->actingAs($user)
            ->get(route('trainings.registration.confirmation', [$training->slug, $participant->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('trainingAccess.can_access', false)
                ->missing('trainingAccess.url')
                ->missing('trainingAccess.label'));
    }

    public function test_registered_user_can_access_the_training(): void
    {
        [$user, $training] = $this->completedRegistration();

        $this->actingAs($user)
            ->get(route('learning.show', $training))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Frontend/learning/show'));
    }

    public function test_training_detail_get_is_not_rate_limited(): void
    {
        $training = $this->training();

        foreach (range(1, 10) as $attempt) {
            $this->get(route('formations.details', $training->slug))
                ->assertOk()
                ->assertHeaderMissing('Retry-After');
        }
    }

    public function test_registration_rate_limit_is_scoped_by_training(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $firstTraining = $this->training();
        $secondTraining = $this->training();
        $invalidRegistration = ['qty' => 1];

        foreach (range(1, 5) as $attempt) {
            $this->actingAs($user)
                ->post(route('trainings.register', $firstTraining->slug), $invalidRegistration)
                ->assertSessionHasErrors(['first_name', 'last_name', 'email']);
        }

        $this->actingAs($user)
            ->post(route('trainings.register', $firstTraining->slug), $invalidRegistration)
            ->assertTooManyRequests();

        $this->actingAs($user)
            ->post(route('trainings.register', $secondTraining->slug), $invalidRegistration)
            ->assertSessionHasErrors(['first_name', 'last_name', 'email']);
    }

    private function completedRegistration(): array
    {
        $user = User::factory()->create(['role' => 'client']);
        $training = $this->training();
        $participant = TrainingParticipant::query()->create([
            'user_id' => $user->id, 'training_id' => $training->id,
            'name' => $user->name, 'email' => $user->email, 'qty' => 1,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'reference' => TrainingParticipant::generateReference(),
        ]);

        return [$user, $training, $participant];
    }

    private function training(): Training
    {
        return Training::query()->create([
            'title' => 'Formation parcours inscription',
            'slug' => 'formation-inscription-' . uniqid(),
            'excerpt' => 'Test du parcours', 'content' => 'Contenu de test',
            'location' => 'En ligne', 'start_date' => now()->addWeek(),
            'end_date' => now()->addWeek()->addHour(), 'price' => 0,
            'max_participants' => 10, 'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
    }

    private function registrationData(User $user): array
    {
        return [
            'first_name' => 'Client', 'last_name' => 'Test',
            'email' => $user->email, 'phone' => null, 'qty' => 1,
        ];
    }
}
