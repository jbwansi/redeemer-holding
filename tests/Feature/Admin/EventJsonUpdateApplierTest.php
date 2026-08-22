<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventJsonExporter;
use App\Services\EventJsonUpdateApplier;
use DomainException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class EventJsonUpdateApplierTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_portable_fields_and_category_are_updated_while_transactional_data_is_preserved(): void
    {
        [$event, $category, $admin] = $this->fixture();
        $newCategory = $this->category('Atelier', 'atelier');
        $otherFeatured = $this->event($admin, $category, 'autre-vedette', true);
        $participant = EventParticipant::create([
            'event_id' => $event->id, 'user_id' => $admin->id, 'name' => 'Personne protégée',
            'email' => 'protected@example.test', 'phone' => '+41000000000', 'qty' => 2,
            'status' => 'completed', 'reference' => 'TICKET-PRESERVE', 'stripe_session_id' => 'cs_preserve',
            'payment_id' => 'pi_preserve', 'payment_amount' => 250, 'payment_confirmed' => true,
            'checked_in_at' => now(), 'checked_in_by' => $admin->id,
        ]);
        $participantBefore = (array) DB::table('event_participants')->where('id', $participant->id)->first();
        $package = app(EventJsonExporter::class)->package($event);
        $package['data'] = [...$package['data'],
            'title' => 'Titre modifié', 'description' => 'Description modifiée',
            'content' => '<p>Contenu modifié</p>', 'start_date' => now()->addMonths(2)->toIso8601String(),
            'end_date' => now()->addMonths(2)->addHours(4)->toIso8601String(), 'location' => 'Zurich',
            'featured_image' => ['original' => 'events/nouvelle-reference.jpg'],
            'category' => ['slug' => $newCategory->slug, 'name' => $newCategory->name],
            'max_participants' => 250, 'price' => '199.90', 'is_published' => true,
            'is_featured' => true, 'published_at' => now()->toIso8601String(), 'tags' => ['nouveau', 'portable'],
        ];

        $result = app(EventJsonUpdateApplier::class)->apply(json_encode($package));
        $event->refresh();

        $this->assertSame('Titre modifié', $event->title);
        $this->assertSame('Description modifiée', $event->description);
        $this->assertSame('<p>Contenu modifié</p>', $event->content);
        $this->assertSame('Zurich', $event->location);
        $this->assertSame(now()->addMonths(2)->utc()->format('Y-m-d H:i'), $event->start_date->utc()->format('Y-m-d H:i'));
        $this->assertSame(now()->addMonths(2)->addHours(4)->utc()->format('Y-m-d H:i'), $event->end_date->utc()->format('Y-m-d H:i'));
        $this->assertSame($newCategory->id, $event->category_id);
        $this->assertSame(250, $event->max_participants);
        $this->assertSame('199.90', $event->price);
        $this->assertTrue($event->is_published);
        $this->assertTrue($event->is_featured);
        $this->assertSame(['nouveau', 'portable'], $event->tags);
        $this->assertSame(['original' => 'events/nouvelle-reference.jpg'], json_decode($event->getRawOriginal('featured_image'), true));
        $this->assertSame('event-source', $event->slug);
        $this->assertTrue($otherFeatured->fresh()->is_featured);
        $this->assertSame($participantBefore, (array) DB::table('event_participants')->where('id', $participant->id)->first());
        $this->assertSame(0, $result['deleted']);
        $this->assertContains('category', $result['modified_fields']);
        $this->assertEqualsCanonicalizing([
            'title', 'description', 'content', 'start_date', 'end_date', 'location', 'featured_image',
            'max_participants', 'price', 'is_published', 'is_featured', 'published_at', 'tags', 'category',
        ], $result['modified_fields']);
        $this->assertStringContainsString('sans modifier les autres', implode(' ', $result['warnings']));
    }

    public function test_identical_event_causes_no_write_and_second_application_is_idempotent(): void
    {
        [$event] = $this->fixture();
        $json = app(EventJsonExporter::class)->json($event);
        $updatedAt = $event->getRawOriginal('updated_at');
        $writes = 0;
        Event::updating(function (Event $updating) use (&$writes): void {
            if ($updating->slug === 'event-source') {
                $writes++;
            }
        });

        $first = app(EventJsonUpdateApplier::class)->apply($json);
        $second = app(EventJsonUpdateApplier::class)->apply($json);

        $this->assertSame(0, $first['modified']['event_fields']);
        $this->assertSame(0, $second['modified']['event_fields']);
        $this->assertSame($updatedAt, $event->fresh()->getRawOriginal('updated_at'));
        $this->assertSame(0, $writes);
        $this->assertSame(0, $second['deleted']);
    }

    public function test_slug_cannot_be_changed_and_soft_deleted_event_is_blocked(): void
    {
        [$event] = $this->fixture();
        $package = app(EventJsonExporter::class)->package($event);
        $package['data']['slug'] = 'autre-slug';

        $this->expectException(DomainException::class);
        try {
            app(EventJsonUpdateApplier::class)->apply(json_encode($package));
        } finally {
            $this->assertSame('event-source', $event->fresh()->slug);
        }
    }

    public function test_soft_deleted_event_is_never_restored(): void
    {
        [$event] = $this->fixture();
        $json = app(EventJsonExporter::class)->json($event);
        $event->delete();

        $this->expectException(ValidationException::class);
        try {
            app(EventJsonUpdateApplier::class)->apply($json);
        } finally {
            $this->assertTrue($event->fresh()->trashed());
        }
    }

    public function test_missing_and_ambiguous_categories_are_blocked(): void
    {
        [$event] = $this->fixture();
        $package = app(EventJsonExporter::class)->package($event);
        $package['data']['category'] = ['slug' => 'absente', 'name' => 'Absente'];
        try {
            app(EventJsonUpdateApplier::class)->apply(json_encode($package));
            $this->fail('La catégorie absente aurait dû bloquer l’update.');
        } catch (ValidationException) {
            $this->assertSame('event-source', $event->fresh()->slug);
        }

        Schema::table('categories', fn (Blueprint $table) => $table->dropUnique(['slug']));
        DB::table('categories')->insert([
            ['name' => 'Doublon A', 'slug' => 'doublon', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Doublon B', 'slug' => 'doublon', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $package['data']['category'] = ['slug' => 'doublon', 'name' => 'Doublon'];
        $this->expectException(ValidationException::class);
        app(EventJsonUpdateApplier::class)->apply(json_encode($package));
    }

    public function test_backend_revalidation_rejects_sensitive_data_and_ignores_fake_frontend_plan(): void
    {
        [$event, , $admin] = $this->fixture();
        $package = app(EventJsonExporter::class)->package($event);
        $package['data']['participants'] = [['email' => 'intrus@example.test']];

        $response = $this->actingAs($admin)->post(route('events.import-export.update'), [
            'file' => UploadedFile::fake()->createWithContent('event.json', json_encode($package)),
            'plan' => ['event' => ['action' => 'UNCHANGED']], 'deleted' => 999,
        ]);

        $response->assertSessionHasErrors('file');
        $this->assertDatabaseMissing('users', ['email' => 'intrus@example.test']);
        $this->assertSame(0, EventParticipant::count());
    }

    public function test_valid_backend_diff_is_applied_even_when_frontend_sends_fake_unchanged_plan(): void
    {
        [$event, , $admin] = $this->fixture();
        $package = app(EventJsonExporter::class)->package($event);
        $package['data']['title'] = 'Décision backend';

        $response = $this->actingAs($admin)->post(route('events.import-export.update'), [
            'file' => UploadedFile::fake()->createWithContent('event.json', json_encode($package)),
            'status' => 'new', 'plan' => ['event' => ['action' => 'UNCHANGED']], 'deleted' => 999,
        ]);

        $response->assertRedirect(route('events.import-export'));
        $this->followRedirects($response)->assertInertia(fn ($page) => $page
            ->where('updateResult.modified.event_fields', 1)
            ->where('updateResult.deleted', 0));
        $this->assertSame('Décision backend', $event->fresh()->title);
    }

    public function test_transaction_rolls_back_when_model_fails_after_update(): void
    {
        [$event] = $this->fixture('rollback-event');
        $package = app(EventJsonExporter::class)->package($event);
        $package['data']['title'] = 'Ne doit pas persister';
        Event::updated(function (Event $updated): void {
            if ($updated->slug === 'rollback-event') {
                throw new \RuntimeException('Échec simulé après écriture.');
            }
        });

        try {
            app(EventJsonUpdateApplier::class)->apply(json_encode($package));
            $this->fail('Une exception était attendue.');
        } catch (\RuntimeException) {
            $this->assertSame('Event source', $event->fresh()->title);
        }
    }

    private function fixture(string $slug = 'event-source'): array
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = $this->category('Conférence', 'conference');

        return [$this->event($admin, $category, $slug), $category, $admin];
    }

    private function category(string $name, string $slug): Category
    {
        $category = Category::create(compact('name', 'slug'));
        DB::table('event_categories')->insert([
            'id' => $category->id, 'name' => $name, 'slug' => $slug, 'description' => null,
            'color' => '#000000', 'created_at' => now(), 'updated_at' => now(),
        ]);

        return $category;
    }

    private function event(User $admin, Category $category, string $slug, bool $featured = false): Event
    {
        return Event::create([
            'category_id' => $category->id, 'user_id' => $admin->id, 'title' => 'Event source',
            'slug' => $slug, 'description' => 'Description', 'content' => '<p>Contenu</p>',
            'location' => 'Genève', 'start_date' => now()->addMonth()->startOfMinute(),
            'end_date' => now()->addMonth()->addHours(2)->startOfMinute(), 'price' => 90,
            'max_participants' => 100, 'is_published' => false, 'is_featured' => $featured,
            'published_at' => null, 'tags' => ['initial'],
        ]);
    }
}
