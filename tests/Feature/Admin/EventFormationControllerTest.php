<?php

namespace Tests\Feature\Admin;

use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\RequireAdminAccess;
use App\Models\Category;
use App\Models\Event;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EventFormationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([
            RequireAdminAccess::class,
            EnsureUserIsActive::class,
        ]);
    }

    public function test_event_update_sets_max_participants_to_null_when_zero(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => 1,
        ]);

        $category = Category::create([
            'name' => 'Business',
            'slug' => 'business',
        ]);

        DB::table('event_categories')->insert([
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => null,
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $event = Event::create([
            'title' => 'Event test',
            'slug' => 'event-test',
            'description' => 'Description initiale',
            'content' => 'Contenu initial',
            'location' => 'Lausanne',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'start_date' => now()->addDays(2),
            'end_date' => now()->addDays(3),
            'price' => 100,
            'max_participants' => 25,
            'is_published' => false,
            'is_featured' => false,
            'tags' => ['initial'],
        ]);

        $response = $this->actingAs($admin)->post(route('events.update', $event->id), [
            'title' => 'Event update',
            'description' => 'Description modifiee',
            'content' => 'Contenu modifie',
            'category_id' => $category->id,
            'location' => 'Geneve',
            'start_date' => now()->addDays(4)->toDateTimeString(),
            'end_date' => now()->addDays(5)->toDateTimeString(),
            'price' => 150,
            'max_participants' => 0,
            'is_published' => true,
            'is_featured' => false,
            'tags' => ['speaker-1', 'speaker-2'],
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();

        $event->refresh();

        $this->assertSame('Event update', $event->title);
        $this->assertNull($event->max_participants);
        $this->assertTrue($event->is_published);
        $this->assertSame(['speaker-1', 'speaker-2'], $event->tags);
    }

    public function test_event_update_unfeatures_other_events_when_current_is_featured(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => 1,
        ]);

        $category = Category::create([
            'name' => 'Leadership',
            'slug' => 'leadership',
        ]);

        DB::table('event_categories')->insert([
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => null,
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $featuredEvent = Event::create([
            'title' => 'Event deja featured',
            'slug' => 'event-featured-1',
            'description' => 'Desc',
            'content' => 'Content',
            'location' => 'Zurich',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
            'price' => 50,
            'max_participants' => 10,
            'is_published' => false,
            'is_featured' => true,
            'tags' => ['a'],
        ]);

        $eventToUpdate = Event::create([
            'title' => 'Event a updater',
            'slug' => 'event-featured-2',
            'description' => 'Desc2',
            'content' => 'Content2',
            'location' => 'Fribourg',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'start_date' => now()->addDays(3),
            'end_date' => now()->addDays(4),
            'price' => 80,
            'max_participants' => 12,
            'is_published' => false,
            'is_featured' => false,
            'tags' => ['b'],
        ]);

        $response = $this->actingAs($admin)->post(route('events.update', $eventToUpdate->id), [
            'title' => 'Event a updater',
            'description' => 'Desc2',
            'content' => 'Content2',
            'category_id' => $category->id,
            'location' => 'Fribourg',
            'start_date' => now()->addDays(3)->toDateTimeString(),
            'end_date' => now()->addDays(4)->toDateTimeString(),
            'price' => 80,
            'max_participants' => 12,
            'is_published' => false,
            'is_featured' => true,
            'tags' => ['b'],
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();

        $featuredEvent->refresh();
        $eventToUpdate->refresh();

        $this->assertFalse($featuredEvent->is_featured);
        $this->assertTrue($eventToUpdate->is_featured);
    }

    public function test_formation_update_persists_meeting_link_and_sets_max_participants_null_when_zero(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => 1,
        ]);

        $formation = Formation::create([
            'title' => 'Formation initiale',
            'slug' => 'formation-initiale',
            'excerpt' => 'Extrait',
            'content' => 'Contenu',
            'location' => 'Neuchatel',
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(8),
            'price' => 250,
            'max_participants' => 15,
            'meeting_link' => null,
            'is_published' => false,
            'is_featured' => false,
            'user_id' => $admin->id,
            'tags' => ['init'],
        ]);

        $response = $this->actingAs($admin)->post(route('formations.update', $formation->id), [
            'title' => 'Formation modifiee',
            'excerpt' => 'Extrait modifie',
            'content' => 'Contenu modifie',
            'location' => 'Berne',
            'start_date' => now()->addDays(9)->toDateTimeString(),
            'end_date' => now()->addDays(10)->toDateTimeString(),
            'price' => 300,
            'max_participants' => 0,
            'meeting_link' => 'https://zoom.us/j/123456789',
            'is_published' => true,
            'is_featured' => false,
            'tags' => ['avance'],
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();

        $formation->refresh();

        $this->assertSame('Formation modifiee', $formation->title);
        $this->assertNull($formation->max_participants);
        $this->assertSame('https://zoom.us/j/123456789', $formation->meeting_link);
        $this->assertTrue($formation->is_published);
    }
}
