<?php

namespace Tests\Feature;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use App\Http\Middleware\OnlyTestUsers;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingCancellationSafetyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_owner_can_cancel_a_free_training_registration(): void
    {
        [$user, $training, $participant] = $this->registration(price: 0, paid: false);
        $participant->update(['status' => TrainingParticipant::STATUS_COMPLETED]);

        $this->actingAs($user)
            ->delete(route('trainings.registration.cancel', [$training->slug, $participant->id]))
            ->assertRedirect(route('formations.details', $training->slug));

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_CANCELLED,
        ]);
    }

    public function test_owner_can_cancel_a_paid_training_when_payment_was_not_completed(): void
    {
        [$user, $training, $participant] = $this->registration(price: 120, paid: false);

        $this->actingAs($user)
            ->delete(route('trainings.registration.cancel', [$training->slug, $participant->id]))
            ->assertRedirect(route('formations.details', $training->slug));

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_CANCELLED,
            'payment_confirmed' => false,
            'payment_id' => null,
        ]);
    }

    public function test_paid_registration_cannot_be_cancelled_and_repeated_attempts_have_no_effect(): void
    {
        [$user, $training, $participant] = $this->registration(price: 120, paid: true);
        $originalPaymentDate = $participant->payment_date;

        foreach ([1, 2] as $attempt) {
            $this->actingAs($user)
                ->delete(route('trainings.registration.cancel', [$training->slug, $participant->id]))
                ->assertSessionHasErrors('general');

            $participant->refresh();
            $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
            $this->assertSame('pi_training_paid', $participant->payment_id);
            $this->assertSame('126.00', $participant->payment_amount);
            $this->assertTrue($participant->payment_confirmed);
            $this->assertTrue($participant->payment_date->equalTo($originalPaymentDate));
            $this->assertNull($participant->cancelled_at);
            $this->assertNull($participant->refund_id);
            $this->assertNull($participant->refund_date);
        }
    }

    public function test_another_user_cannot_cancel_the_registration(): void
    {
        [, $training, $participant] = $this->registration(price: 0, paid: false);
        $otherUser = User::factory()->create(['role' => 'client']);

        $this->actingAs($otherUser)
            ->delete(route('trainings.registration.cancel', [$training->slug, $participant->id]))
            ->assertForbidden();

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_PENDING,
        ]);
    }

    public function test_admin_cannot_revoke_a_registration_with_a_confirmed_payment(): void
    {
        [$user, , $participant] = $this->registration(price: 120, paid: true);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('users.trainings.unassign', [$user, $participant]))
            ->assertSessionHas('error');

        $participant->refresh();
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $participant->status);
        $this->assertSame('pi_training_paid', $participant->payment_id);
        $this->assertTrue($participant->payment_confirmed);
        $this->assertNull($participant->cancelled_by_admin_id);
        $this->assertNull($participant->cancelled_at);
    }

    public function test_admin_can_revoke_a_free_administrative_assignment(): void
    {
        [$user, , $participant] = $this->registration(price: 120, paid: false);
        $admin = User::factory()->create(['role' => 'admin']);
        $participant->update([
            'assigned_by_admin_id' => $admin->id,
            'status' => TrainingParticipant::STATUS_COMPLETED,
            'payment_id' => 'admin-assigned-test',
            'payment_amount' => 0,
            'payment_confirmed' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('users.trainings.unassign', [$user, $participant]))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('training_participants', [
            'id' => $participant->id,
            'status' => TrainingParticipant::STATUS_CANCELLED,
            'cancelled_by_admin_id' => $admin->id,
        ]);
    }

    private function registration(float $price, bool $paid): array
    {
        $user = User::factory()->create(['role' => 'client']);
        $training = Training::query()->create([
            'title' => 'Formation sécurité annulation',
            'slug' => 'formation-securite-' . uniqid(),
            'excerpt' => 'Test',
            'content' => 'Test',
            'location' => 'En ligne',
            'start_date' => now()->addWeek(),
            'end_date' => now()->addWeek()->addHour(),
            'price' => $price,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);

        $participant = TrainingParticipant::query()->create([
            'user_id' => $user->id,
            'training_id' => $training->id,
            'name' => $user->name,
            'email' => $user->email,
            'qty' => 1,
            'status' => $paid ? TrainingParticipant::STATUS_COMPLETED : TrainingParticipant::STATUS_PENDING,
            'reference' => TrainingParticipant::generateReference(),
            'payment_id' => $paid ? 'pi_training_paid' : null,
            'payment_amount' => $paid ? 126 : null,
            'payment_date' => $paid ? now() : null,
            'payment_confirmed' => $paid,
        ]);

        return [$user, $training, $participant];
    }
}
