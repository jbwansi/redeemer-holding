<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EventJsonExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_export_portable_event_without_transactional_data(): void
    {
        Carbon::setTestNow('2026-08-22 10:00:00');

        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = Category::create([
            'name' => 'Conférence',
            'slug' => 'conference',
        ]);
        $this->mirrorCategory($category);
        $event = Event::create([
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'title' => 'Sommet Éthique®',
            'slug' => 'sommet-ethique-2026',
            'description' => 'Présentation',
            'content' => '<p>Contenu événementiel</p>',
            'featured_image' => ['original' => 'events/sommet-éthique.jpg'],
            'location' => 'Genève',
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonth()->addHours(3),
            'price' => 90.50,
            'max_participants' => 120,
            'views' => 987,
            'is_published' => true,
            'is_featured' => true,
            'published_at' => now(),
            'tags' => ['éthique', 'réseau'],
        ]);
        EventParticipant::create([
            'event_id' => $event->id,
            'user_id' => $admin->id,
            'name' => 'Participant Secret',
            'email' => 'secret@example.test',
            'phone' => '+41000000000',
            'reference' => 'TICKET-SECRET',
            'stripe_session_id' => 'cs_secret',
            'payment_id' => 'pi_secret',
            'status' => 'completed',
            'qty' => 2,
        ]);

        $response = $this->actingAs($admin)->get(route('events.export-json', $event));

        $response->assertOk()
            ->assertHeader('content-type', 'application/json; charset=UTF-8')
            ->assertDownload('redeemer-event-sommet-ethique-2026.json');

        $json = $response->streamedContent();
        $package = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame('1.0', $package['schema_version']);
        $this->assertSame('event', $package['type']);
        $this->assertSame('sommet-ethique-2026', $package['data']['slug']);
        $this->assertSame(['slug' => 'conference', 'name' => 'Conférence'], $package['data']['category']);
        $this->assertSame('events/sommet-éthique.jpg', $package['data']['featured_image']['original']);
        $this->assertArrayNotHasKey('id', $package['data']);
        $this->assertArrayNotHasKey('category_id', $package['data']);
        $this->assertArrayNotHasKey('user_id', $package['data']);
        $this->assertArrayNotHasKey('views', $package['data']);
        $this->assertArrayNotHasKey('participants', $package['data']);
        $this->assertStringNotContainsString('Participant Secret', $json);
        $this->assertStringNotContainsString('secret@example.test', $json);
        $this->assertStringNotContainsString('TICKET-SECRET', $json);
        $this->assertStringNotContainsString('cs_secret', $json);
        $this->assertStringNotContainsString('pi_secret', $json);
    }

    public function test_non_admin_cannot_export_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = Category::create(['name' => 'Atelier', 'slug' => 'atelier']);
        $this->mirrorCategory($category);
        $event = Event::create([
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'title' => 'Atelier privé',
            'slug' => 'atelier-prive',
            'description' => 'Description',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
        ]);
        $client = User::factory()->create(['role' => 'client', 'is_active' => 1]);

        $this->actingAs($client)->get(route('events.export-json', $event))->assertForbidden();
    }

    private function mirrorCategory(Category $category): void
    {
        DB::table('event_categories')->insert([
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => null,
            'color' => '#112233',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
