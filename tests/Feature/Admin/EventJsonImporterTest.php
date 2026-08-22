<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventJsonImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class EventJsonImporterTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_event_is_created_with_category_author_and_media_reference(): void
    {
        [$admin, $category] = $this->fixture();
        $package = $this->package($category);

        $result = app(EventJsonImporter::class)->import(json_encode($package), $admin->id, 'event.json');

        $event = Event::where('slug', 'event-importe')->firstOrFail();
        $this->assertSame($category->id, $event->category_id);
        $this->assertSame($admin->id, $event->user_id);
        $this->assertSame('Événement importé', $event->title);
        $this->assertSame('Description portable', $event->description);
        $this->assertSame('<p>Contenu portable</p>', $event->content);
        $this->assertSame('Genève', $event->location);
        $this->assertSame('125.50', $event->price);
        $this->assertSame(80, $event->max_participants);
        $this->assertSame(['réseau'], $event->tags);
        $this->assertSame(['original' => 'events/reference.jpg'], json_decode($event->getRawOriginal('featured_image'), true));
        $this->assertSame(1, $result['created']['events']);
        $this->assertSame(0, $result['deleted']);
        $this->assertStringContainsString('aucun fichier physique', implode(' ', $result['warnings']));
        $this->assertSame(0, EventParticipant::count());
    }

    public function test_sensitive_field_is_refused_and_nothing_is_created(): void
    {
        [$admin, $category] = $this->fixture();
        $package = $this->package($category);
        $package['data']['participants'] = [['email' => 'secret@example.test']];

        try {
            app(EventJsonImporter::class)->import(json_encode($package), $admin->id);
            $this->fail('Une ValidationException était attendue.');
        } catch (ValidationException $exception) {
            $this->assertStringContainsString('participants', implode(' ', $exception->errors()['file']));
        }

        $this->assertDatabaseMissing('events', ['slug' => 'event-importe']);
        $this->assertDatabaseMissing('users', ['email' => 'secret@example.test']);
    }

    public function test_existing_and_soft_deleted_slugs_are_refused(): void
    {
        [$admin, $category] = $this->fixture();
        $package = $this->package($category);
        $existing = $this->existingEvent($admin, $category, 'event-importe');

        foreach ([false, true] as $softDeleted) {
            if ($softDeleted) {
                $existing->delete();
            }

            try {
                app(EventJsonImporter::class)->import(json_encode($package), $admin->id);
                $this->fail('L’import aurait dû être refusé.');
            } catch (\Throwable $exception) {
                $this->assertTrue($exception instanceof ValidationException || $exception instanceof \DomainException);
            }
        }

        $this->assertSame(1, Event::withTrashed()->where('slug', 'event-importe')->count());
    }

    public function test_missing_category_is_refused_without_automatic_creation(): void
    {
        [$admin, $category] = $this->fixture();
        $package = $this->package($category);
        $package['data']['category'] = ['slug' => 'categorie-absente', 'name' => 'Absente'];
        $count = Category::count();

        $this->expectException(ValidationException::class);
        try {
            app(EventJsonImporter::class)->import(json_encode($package), $admin->id);
        } finally {
            $this->assertSame($count, Category::count());
            $this->assertDatabaseMissing('events', ['slug' => 'event-importe']);
        }
    }

    public function test_file_is_fully_revalidated_at_confirmation(): void
    {
        [$admin, $category] = $this->fixture();
        $package = $this->package($category);
        $package['type'] = 'training';

        $this->expectException(ValidationException::class);
        try {
            app(EventJsonImporter::class)->import(json_encode($package), $admin->id);
        } finally {
            $this->assertDatabaseMissing('events', ['slug' => 'event-importe']);
        }
    }

    public function test_transaction_rolls_back_when_fk_mirror_is_missing(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = Category::create(['name' => 'Sans miroir', 'slug' => 'sans-miroir']);
        $package = $this->package($category);

        try {
            app(EventJsonImporter::class)->import(json_encode($package), $admin->id);
            $this->fail('La contrainte FK aurait dû échouer.');
        } catch (\Throwable $exception) {
            $this->assertNotInstanceOf(ValidationException::class, $exception);
        }

        $this->assertDatabaseMissing('events', ['slug' => 'event-importe']);
        $this->assertSame(1, Category::count());
    }

    public function test_admin_can_confirm_creation_through_backend_route(): void
    {
        [$admin, $category] = $this->fixture();

        $response = $this->actingAs($admin)->post(route('events.import-export.create'), [
            'file' => UploadedFile::fake()->createWithContent('event.json', json_encode($this->package($category))),
            'status' => 'new',
            'plan' => ['event' => ['action' => 'CREATE']],
        ]);

        $response->assertRedirect(route('events.import-export'));
        $this->followRedirects($response)->assertInertia(fn ($page) => $page
            ->component('backend/events/import-export', false)
            ->where('importResult.event.slug', 'event-importe')
            ->where('importResult.deleted', 0));
        $this->assertDatabaseHas('events', ['slug' => 'event-importe', 'user_id' => $admin->id]);
    }

    private function fixture(): array
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = Category::create(['name' => 'Conférence', 'slug' => 'conference']);
        DB::table('event_categories')->insert([
            'id' => $category->id, 'name' => $category->name, 'slug' => $category->slug,
            'description' => null, 'color' => '#000000', 'created_at' => now(), 'updated_at' => now(),
        ]);

        return [$admin, $category];
    }

    private function package(Category $category): array
    {
        return [
            'schema_version' => '1.0', 'type' => 'event', 'exported_at' => now()->toIso8601String(),
            'data' => [
                'title' => 'Événement importé', 'slug' => 'event-importe',
                'description' => 'Description portable', 'content' => '<p>Contenu portable</p>',
                'start_date' => now()->addMonth()->toIso8601String(),
                'end_date' => now()->addMonth()->addHours(2)->toIso8601String(), 'location' => 'Genève',
                'featured_image' => ['original' => 'events/reference.jpg'],
                'category' => ['slug' => $category->slug, 'name' => $category->name],
                'max_participants' => 80, 'price' => '125.50', 'is_published' => true,
                'is_featured' => false, 'published_at' => now()->toIso8601String(), 'tags' => ['réseau'],
            ],
        ];
    }

    private function existingEvent(User $admin, Category $category, string $slug): Event
    {
        return Event::create([
            'category_id' => $category->id, 'user_id' => $admin->id, 'title' => 'Existant',
            'slug' => $slug, 'description' => 'Description', 'content' => 'Contenu', 'location' => 'Lausanne',
            'start_date' => now()->addDay(), 'end_date' => now()->addDays(2),
        ]);
    }
}
