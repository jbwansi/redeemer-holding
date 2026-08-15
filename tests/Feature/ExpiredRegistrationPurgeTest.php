<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ExpiredRegistrationPurgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_recent_registrations_are_not_purged(): void
    {
        [, $trainingParticipant] = $this->trainingParticipant();
        [, $eventParticipant] = $this->eventParticipant();

        $this->assertSame(0, TrainingParticipant::purgeExpiredRegistrations());
        $this->assertSame(0, EventParticipant::purgeExpiredRegistrations());

        $this->assertSame(TrainingParticipant::STATUS_PENDING, $trainingParticipant->fresh()->status);
        $this->assertSame(EventParticipant::STATUS_PENDING, $eventParticipant->fresh()->status);
    }

    public function test_multiple_expired_unpaid_registrations_are_cancelled_and_release_capacity(): void
    {
        [$training] = $this->trainingParticipant(createdAt: now()->subMinutes(31), quantity: 2);
        $this->trainingParticipant($training, createdAt: now()->subMinutes(31), quantity: 1);
        [$event] = $this->eventParticipant(createdAt: now()->subMinutes(31), quantity: 2);
        $this->eventParticipant($event, createdAt: now()->subMinutes(31), quantity: 1);

        $this->assertSame(3, $training->fresh()->reserved_seats);
        $this->assertSame(3, $event->fresh()->reserved_seats);

        $this->assertSame(2, TrainingParticipant::purgeExpiredRegistrations());
        $this->assertSame(2, EventParticipant::purgeExpiredRegistrations());

        $this->assertSame(0, $training->fresh()->reserved_seats);
        $this->assertSame(0, $event->fresh()->reserved_seats);
        $this->assertSame(5, $training->fresh()->available_seats);
        $this->assertSame(5, $event->fresh()->available_seats);
    }

    public function test_confirmed_and_completed_registrations_are_never_purged(): void
    {
        [, $confirmedTraining] = $this->trainingParticipant(
            status: TrainingParticipant::STATUS_IN_PROGRESS,
            paymentConfirmed: true,
            createdAt: now()->subMinutes(31)
        );
        [, $completedTraining] = $this->trainingParticipant(
            status: TrainingParticipant::STATUS_COMPLETED,
            createdAt: now()->subMinutes(31)
        );
        [, $confirmedEvent] = $this->eventParticipant(
            status: EventParticipant::STATUS_IN_PROGRESS,
            paymentConfirmed: true,
            createdAt: now()->subMinutes(31)
        );
        [, $completedEvent] = $this->eventParticipant(
            status: EventParticipant::STATUS_COMPLETED,
            createdAt: now()->subMinutes(31)
        );

        $this->assertSame(0, TrainingParticipant::purgeExpiredRegistrations());
        $this->assertSame(0, EventParticipant::purgeExpiredRegistrations());

        $this->assertSame(TrainingParticipant::STATUS_IN_PROGRESS, $confirmedTraining->fresh()->status);
        $this->assertSame(TrainingParticipant::STATUS_COMPLETED, $completedTraining->fresh()->status);
        $this->assertSame(EventParticipant::STATUS_IN_PROGRESS, $confirmedEvent->fresh()->status);
        $this->assertSame(EventParticipant::STATUS_COMPLETED, $completedEvent->fresh()->status);
    }

    public function test_checked_in_event_registration_is_never_purged(): void
    {
        [, $participant] = $this->eventParticipant(
            status: EventParticipant::STATUS_IN_PROGRESS,
            createdAt: now()->subMinutes(31),
            checkedInAt: now()
        );

        $this->assertSame(0, EventParticipant::purgeExpiredRegistrations());
        $this->assertSame(EventParticipant::STATUS_IN_PROGRESS, $participant->fresh()->status);
        $this->assertNotNull($participant->fresh()->checked_in_at);
    }

    public function test_purge_command_is_scheduled_and_idempotent(): void
    {
        [, $trainingParticipant] = $this->trainingParticipant(createdAt: now()->subMinutes(31));
        [, $eventParticipant] = $this->eventParticipant(createdAt: now()->subMinutes(31));

        $this->artisan('registrations:purge-expired')->assertExitCode(0);
        $this->artisan('registrations:purge-expired')->assertExitCode(0);

        $this->assertSame(TrainingParticipant::STATUS_CANCELLED, $trainingParticipant->fresh()->status);
        $this->assertSame(EventParticipant::STATUS_CANCELLED, $eventParticipant->fresh()->status);
        $this->assertTrue(collect(app(Schedule::class)->events())->contains(
            fn ($event) => str_contains($event->command, 'registrations:purge-expired')
                && $event->expression === '*/5 * * * *'
        ));
    }

    private function trainingParticipant(
        ?Training $training = null,
        string $status = TrainingParticipant::STATUS_PENDING,
        bool $paymentConfirmed = false,
        ?\DateTimeInterface $createdAt = null,
        int $quantity = 1
    ): array {
        $training ??= Training::query()->create([
            'title' => 'Formation purge',
            'slug' => 'formation-purge-'.uniqid(),
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => 100,
            'max_participants' => 5,
            'is_published' => true,
            'published_at' => now(),
        ]);
        $participant = TrainingParticipant::query()->create([
            'training_id' => $training->id,
            'name' => 'Participant formation',
            'email' => 'training-'.uniqid().'@example.test',
            'qty' => $quantity,
            'status' => $status,
            'reference' => TrainingParticipant::generateReference(),
            'payment_confirmed' => $paymentConfirmed,
        ]);

        if ($createdAt) {
            $participant->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->save();
        }

        return [$training, $participant];
    }

    private function eventParticipant(
        ?Event $event = null,
        string $status = EventParticipant::STATUS_PENDING,
        bool $paymentConfirmed = false,
        ?\DateTimeInterface $createdAt = null,
        int $quantity = 1,
        ?\DateTimeInterface $checkedInAt = null
    ): array {
        if (! $event) {
            $owner = User::factory()->create();
            $categoryId = DB::table('event_categories')->insertGetId([
                'name' => 'Purge',
                'slug' => 'purge-'.uniqid(),
                'color' => '#000000',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $event = Event::query()->create([
                'title' => 'Événement purge',
                'slug' => 'event-purge-'.uniqid(),
                'description' => 'Description',
                'content' => 'Contenu',
                'location' => 'Lausanne',
                'category_id' => $categoryId,
                'user_id' => $owner->id,
                'start_date' => now()->addDay(),
                'end_date' => now()->addDays(2),
                'price' => 100,
                'max_participants' => 5,
                'is_published' => true,
                'published_at' => now(),
            ]);
        }

        $participant = EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Participant événement',
            'email' => 'event-'.uniqid().'@example.test',
            'qty' => $quantity,
            'status' => $status,
            'reference' => EventParticipant::generateReference(),
            'payment_confirmed' => $paymentConfirmed,
            'checked_in_at' => $checkedInAt,
        ]);

        if ($createdAt) {
            $participant->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->save();
        }

        return [$event, $participant];
    }
}