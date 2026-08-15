<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EventRegistrationPhase1ATest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(OnlyTestUsers::class);
        Mail::fake();
    }

    public function test_guest_can_register_for_a_free_event_and_is_redirected_to_confirmation(): void
    {
        $event = $this->createEvent(price: 0);

        $response = $this->post(route('events.register', $event->slug), $this->registrationData([
            'email' => ' GUEST@EXAMPLE.COM ',
        ]));

        $participant = EventParticipant::query()->sole();

        $response->assertRedirect(route('events.registration.confirmation', [
            'slug' => $event->slug,
            'participant_id' => $participant->id,
        ]));
        $response->assertSessionHas('temp_participant_'.$participant->id, true);

        $this->assertDatabaseHas('event_participants', [
            'id' => $participant->id,
            'event_id' => $event->id,
            'user_id' => null,
            'email' => 'guest@example.com',
            'status' => EventParticipant::STATUS_COMPLETED,
        ]);
        $this->assertNotEmpty($participant->reference);
    }

    public function test_authenticated_registration_is_linked_to_the_user(): void
    {
        $user = User::factory()->create();
        $event = $this->createEvent(price: 0);

        $this->actingAs($user)
            ->post(route('events.register', $event->slug), $this->registrationData())
            ->assertRedirect();

        $this->assertDatabaseHas('event_participants', [
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => EventParticipant::STATUS_COMPLETED,
        ]);
    }

    public function test_guest_cannot_create_a_second_active_registration_with_the_same_email(): void
    {
        $event = $this->createEvent(price: 0);

        $this->post(route('events.register', $event->slug), $this->registrationData())
            ->assertRedirect();

        $this->post(route('events.register', $event->slug), $this->registrationData([
            'email' => 'PARTICIPANT@EXAMPLE.COM',
        ]))
            ->assertSessionHasErrors('general');

        $this->assertDatabaseCount('event_participants', 1);
    }

    public function test_authenticated_user_cannot_register_twice_even_with_another_email(): void
    {
        $user = User::factory()->create();
        $event = $this->createEvent(price: 0);

        $this->actingAs($user)
            ->post(route('events.register', $event->slug), $this->registrationData())
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('events.register', $event->slug), $this->registrationData([
                'email' => 'another@example.com',
            ]))
            ->assertSessionHasErrors('general');

        $this->assertDatabaseCount('event_participants', 1);
    }

    public function test_capacity_cannot_be_exceeded(): void
    {
        $event = $this->createEvent(price: 0, maxParticipants: 1);

        EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Déjà inscrit',
            'email' => 'existing@example.com',
            'qty' => 1,
            'status' => EventParticipant::STATUS_COMPLETED,
            'reference' => EventParticipant::generateReference(),
        ]);

        $this->post(route('events.register', $event->slug), $this->registrationData())
            ->assertSessionHasErrors('general');

        $this->assertDatabaseCount('event_participants', 1);
    }

    public function test_cancelled_registration_does_not_prevent_a_new_registration(): void
    {
        $event = $this->createEvent(price: 0);

        EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Ancienne inscription',
            'email' => 'participant@example.com',
            'qty' => 1,
            'status' => EventParticipant::STATUS_CANCELLED,
            'reference' => EventParticipant::generateReference(),
        ]);

        $this->post(route('events.register', $event->slug), $this->registrationData())
            ->assertRedirect();

        $this->assertDatabaseCount('event_participants', 2);
        $this->assertDatabaseHas('event_participants', [
            'event_id' => $event->id,
            'email' => 'participant@example.com',
            'status' => EventParticipant::STATUS_COMPLETED,
        ]);
    }

    public function test_event_reference_is_unique_at_database_level(): void
    {
        $event = $this->createEvent(price: 0);
        $reference = 'EVENT001';

        EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Premier',
            'email' => 'first@example.com',
            'qty' => 1,
            'status' => EventParticipant::STATUS_COMPLETED,
            'reference' => $reference,
        ]);

        $this->expectException(QueryException::class);

        EventParticipant::query()->create([
            'event_id' => $event->id,
            'name' => 'Second',
            'email' => 'second@example.com',
            'qty' => 1,
            'status' => EventParticipant::STATUS_COMPLETED,
            'reference' => $reference,
        ]);
    }

    private function createEvent(float $price, ?int $maxParticipants = 20): Event
    {
        $owner = User::factory()->create();
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Catégorie test',
            'slug' => 'categorie-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Event::query()->create([
            'title' => 'Événement Phase 1A',
            'slug' => 'event-'.uniqid(),
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $owner->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => $price,
            'max_participants' => $maxParticipants,
            'is_published' => true,
            'published_at' => now()->subMinute(),
        ]);
    }

    private function registrationData(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Jean',
            'last_name' => 'Test',
            'email' => 'participant@example.com',
            'phone' => '+41790000000',
            'qty' => 1,
        ], $overrides);
    }
}
