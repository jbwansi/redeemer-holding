<?php

namespace Tests\Feature\Admin;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Services\ServiceJsonImporter;
use App\Services\ServiceJsonUpdateApplier;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceJsonImportApplyTest extends TestCase
{
    use RefreshDatabase;

    public function test_creation_uses_author_defaults_and_never_imports_technical_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $result = app(ServiceJsonImporter::class)->import($this->documentJson([
            'name' => 'Créé', 'slug' => 'cree', 'tagline' => 'Portable',
        ]), $admin->id);
        $service = Service::where('slug', 'cree')->firstOrFail();

        $this->assertSame($admin->id, $service->user_id);
        $this->assertSame(0, $service->views);
        $this->assertFalse((bool) $service->status);
        $this->assertSame(1, $result['created']);
        $this->assertSame(0, $result['deleted']);
    }

    public function test_creation_imports_audiences_and_legacy_file_keeps_false_defaults(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        app(ServiceJsonImporter::class)->import($this->documentJson([
            'name' => 'Deux publics',
            'slug' => 'deux-publics',
            'audiences' => ['individuals' => true, 'organizations' => true],
        ]), $admin->id);
        app(ServiceJsonImporter::class)->import($this->documentJson([
            'name' => 'Ancien fichier',
            'slug' => 'ancien-fichier',
        ]), $admin->id);

        $both = Service::where('slug', 'deux-publics')->firstOrFail();
        $legacy = Service::where('slug', 'ancien-fichier')->firstOrFail();
        $this->assertTrue($both->is_for_individuals);
        $this->assertTrue($both->is_for_organizations);
        $this->assertFalse($legacy->is_for_individuals);
        $this->assertFalse($legacy->is_for_organizations);
    }

    public function test_update_is_non_destructive_supports_null_and_is_idempotent(): void
    {
        $owner = User::factory()->create();
        $service = Service::create([
            'user_id' => $owner->id, 'name' => 'Local', 'slug' => 'local', 'excerpt' => 'Préservé',
            'tagline' => 'Avant', 'views' => 99, 'status' => true,
        ]);
        ServiceRequest::create([
            'service_id' => $service->id, 'first_name' => 'Client', 'last_name' => 'Privé', 'email' => 'client@example.test',
        ]);
        $json = $this->documentJson(['slug' => 'local', 'tagline' => null, 'featured_note' => 'Après']);

        $first = app(ServiceJsonUpdateApplier::class)->apply($json);
        $second = app(ServiceJsonUpdateApplier::class)->apply($json);
        $service->refresh();

        $this->assertNull($service->tagline);
        $this->assertSame('Après', $service->featured_note);
        $this->assertSame('Préservé', $service->excerpt);
        $this->assertSame($owner->id, $service->user_id);
        $this->assertSame(99, $service->views);
        $this->assertSame(1, ServiceRequest::where('service_id', $service->id)->count());
        $this->assertSame(2, $first['modified']['service_fields']);
        $this->assertSame(0, $second['modified']['service_fields']);
        $this->assertSame(0, $first['deleted']);
    }

    public function test_slug_is_identity_and_cannot_be_changed_by_update(): void
    {
        Service::create(['name' => 'Local', 'slug' => 'local']);

        $this->expectException(DomainException::class);
        app(ServiceJsonUpdateApplier::class)->apply($this->documentJson(['name' => 'Renommé', 'slug' => 'autre']));
    }

    public function test_late_slug_collision_is_rechecked_and_refused(): void
    {
        $admin = User::factory()->create();
        $json = $this->documentJson(['name' => 'Nouveau', 'slug' => 'collision']);
        Service::create(['name' => 'Concurrent', 'slug' => 'collision']);

        try {
            app(ServiceJsonImporter::class)->import($json, $admin->id);
            $this->fail('La collision aurait dû être refusée.');
        } catch (DomainException) {
            $this->assertSame(1, Service::where('slug', 'collision')->count());
        }
    }

    public function test_position_conflict_blocks_update_without_moving_any_service(): void
    {
        $first = Service::create(['name' => 'Premier', 'slug' => 'premier', 'position' => 1]);
        $second = Service::create(['name' => 'Second', 'slug' => 'second', 'position' => 2]);
        $json = $this->documentJson(['slug' => 'second', 'publication' => ['position' => 1]]);

        try {
            app(ServiceJsonUpdateApplier::class)->apply($json);
            $this->fail('Le conflit aurait dû bloquer la mise à jour.');
        } catch (\Throwable) {
            $this->assertSame(1, $first->fresh()->position);
            $this->assertSame(2, $second->fresh()->position);
        }
    }

    private function documentJson(array $data): string
    {
        return json_encode([
            'schema_version' => '1.0', 'type' => 'service', 'exported_at' => now()->toIso8601String(), 'data' => $data,
        ], JSON_THROW_ON_ERROR);
    }
}
