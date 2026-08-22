<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventJsonExporter;
use App\Services\EventJsonImportAnalyzer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class EventJsonImportAnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_round_trip_is_existing_and_unchanged_without_writes(): void
    {
        [$event] = $this->eventFixture();
        EventParticipant::create([
            'event_id' => $event->id, 'email' => 'secret@example.test', 'name' => 'Secret',
            'reference' => 'TICKET-READONLY', 'status' => 'completed',
        ]);
        $before = $this->databaseState();

        $result = app(EventJsonImportAnalyzer::class)->analyze(app(EventJsonExporter::class)->json($event));

        $this->assertTrue($result['valid']);
        $this->assertSame('existing', $result['status']);
        $this->assertSame('UNCHANGED', $result['plan']['event']['action']);
        $this->assertSame('UNCHANGED', $result['plan']['category']['action']);
        $this->assertSame(0, $result['plan']['summary']['deleted']);
        $this->assertTrue($result['plan']['read_only']);
        $this->assertSame($before, $this->databaseState());
    }

    public function test_unknown_event_slug_produces_create_plan_without_creating_event(): void
    {
        [, $category] = $this->eventFixture();
        $package = $this->package($category, ['slug' => 'nouvel-event']);
        $count = Event::withTrashed()->count();

        $result = app(EventJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertTrue($result['valid']);
        $this->assertSame('new', $result['status']);
        $this->assertSame('CREATE', $result['plan']['event']['action']);
        $this->assertSame($count, Event::withTrashed()->count());
    }

    public function test_existing_event_differences_produce_update_plan(): void
    {
        [$event, $category] = $this->eventFixture();
        $package = app(EventJsonExporter::class)->package($event);
        $package['data']['title'] = 'Titre modifié';
        $package['data']['price'] = '125.00';

        $result = app(EventJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertSame('UPDATE', $result['plan']['event']['action']);
        $this->assertSame(['title', 'price'], collect($result['changes'])->where('action', 'UPDATE')->pluck('field')->all());
        $this->assertSame('conference', $category->slug);
        $this->assertSame('Event source', $event->fresh()->title);
    }

    public function test_missing_category_blocks_analysis_and_does_not_create_it(): void
    {
        [, $category] = $this->eventFixture();
        $package = $this->package($category);
        $package['data']['category'] = ['slug' => 'absente', 'name' => 'Absente'];
        $count = Category::count();

        $result = app(EventJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertFalse($result['valid']);
        $this->assertSame('invalid', $result['status']);
        $this->assertSame('AMBIGUOUS', $result['plan']['category']['action']);
        $this->assertStringContainsString('absente', implode(' ', $result['errors']));
        $this->assertSame($count, Category::count());
    }

    public function test_soft_deleted_event_slug_is_ambiguous_and_is_not_restored(): void
    {
        [$event, $category] = $this->eventFixture();
        $event->delete();
        $package = $this->package($category, ['slug' => $event->slug]);

        $result = app(EventJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertFalse($result['valid']);
        $this->assertSame('ambiguous', $result['status']);
        $this->assertSame('AMBIGUOUS', $result['plan']['event']['action']);
        $this->assertSame(1, $result['plan']['summary']['ambiguous']);
        $this->assertTrue($event->fresh()->trashed());
    }

    #[DataProvider('invalidPackageProvider')]
    public function test_strict_invalid_packages_are_rejected(array $package, string $error): void
    {
        $result = app(EventJsonImportAnalyzer::class)->analyze(json_encode($package));

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString($error, implode(' ', $result['errors']));
    }

    public static function invalidPackageProvider(): array
    {
        $data = [
            'title' => 'Event', 'slug' => 'event', 'description' => 'Description', 'content' => 'Contenu',
            'start_date' => '2026-09-01T10:00:00+00:00', 'end_date' => '2026-09-01T12:00:00+00:00',
            'location' => 'Genève', 'featured_image' => null, 'category' => ['slug' => 'conference', 'name' => 'Conférence'],
            'max_participants' => null, 'price' => '0.00', 'is_published' => false, 'is_featured' => false,
            'published_at' => null, 'tags' => [],
        ];

        return [
            'wrong version' => [['schema_version' => '1.1', 'type' => 'event', 'exported_at' => '2026-08-22T10:00:00Z', 'data' => $data], 'version'],
            'wrong type' => [['schema_version' => '1.0', 'type' => 'training', 'exported_at' => '2026-08-22T10:00:00Z', 'data' => $data], 'type'],
            'missing field' => [['schema_version' => '1.0', 'type' => 'event', 'exported_at' => '2026-08-22T10:00:00Z', 'data' => array_diff_key($data, ['slug' => true])], 'data.slug'],
            'transactional field' => [['schema_version' => '1.0', 'type' => 'event', 'exported_at' => '2026-08-22T10:00:00Z', 'data' => [...$data, 'participants' => [['email' => 'secret@example.test']]]], 'participants'],
        ];
    }

    public function test_admin_can_analyze_from_dashboard_and_client_cannot(): void
    {
        [, $category, $admin] = $this->eventFixture();
        $json = json_encode($this->package($category, ['slug' => 'upload-event']));

        $response = $this->actingAs($admin)->post(route('events.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('event.json', $json),
        ]);

        $response->assertRedirect(route('events.import-export'));
        $this->followRedirects($response)->assertInertia(fn ($page) => $page
            ->component('backend/events/import-export', false)
            ->where('analysis.valid', true)
            ->where('analysis.status', 'new'));

        $client = User::factory()->create(['role' => 'client', 'is_active' => 1]);
        $this->actingAs($client)->post(route('events.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('event.json', $json),
        ])->assertForbidden();
    }

    private function eventFixture(): array
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $category = Category::create(['name' => 'Conférence', 'slug' => 'conference']);
        DB::table('event_categories')->insert([
            'id' => $category->id, 'name' => $category->name, 'slug' => $category->slug,
            'description' => null, 'color' => '#000000', 'created_at' => now(), 'updated_at' => now(),
        ]);
        $event = Event::create([
            'category_id' => $category->id, 'user_id' => $admin->id, 'title' => 'Event source',
            'slug' => 'event-source', 'description' => 'Description', 'content' => 'Contenu',
            'location' => 'Genève', 'start_date' => now()->addMonth()->startOfMinute(),
            'end_date' => now()->addMonth()->addHours(2)->startOfMinute(), 'price' => 90,
            'max_participants' => 100, 'is_published' => false, 'is_featured' => false, 'tags' => ['réseau'],
        ]);

        return [$event, $category, $admin];
    }

    private function package(Category $category, array $overrides = []): array
    {
        return [
            'schema_version' => '1.0', 'type' => 'event', 'exported_at' => now()->toIso8601String(),
            'data' => array_merge([
                'title' => 'Event importé', 'slug' => 'event-importe', 'description' => 'Description',
                'content' => 'Contenu', 'start_date' => now()->addMonth()->toIso8601String(),
                'end_date' => now()->addMonth()->addHours(2)->toIso8601String(), 'location' => 'Lausanne',
                'featured_image' => null, 'category' => ['slug' => $category->slug, 'name' => $category->name],
                'max_participants' => null, 'price' => '0.00', 'is_published' => false,
                'is_featured' => false, 'published_at' => null, 'tags' => [],
            ], $overrides),
        ];
    }

    private function databaseState(): array
    {
        return [
            'events' => DB::table('events')->orderBy('id')->get()->map(fn ($row) => (array) $row)->all(),
            'categories' => DB::table('categories')->orderBy('id')->get()->map(fn ($row) => (array) $row)->all(),
            'participants' => DB::table('event_participants')->orderBy('id')->get()->map(fn ($row) => (array) $row)->all(),
        ];
    }
}
