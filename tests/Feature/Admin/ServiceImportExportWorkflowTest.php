<?php

namespace Tests\Feature\Admin;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceImportExportWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_page_and_routes_follow_the_canonical_workflow(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        Service::create(['name' => 'Service', 'slug' => 'service']);

        $this->actingAs($admin)->get(route('services.import-export'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('backend/services/import-export', false)
                ->has('services', 1));

        $routes = file_get_contents(resource_path('js/lib/routes.ts'));
        $page = file_get_contents(resource_path('js/src/backend/services/import-export.tsx'));
        $this->assertStringContainsString("route('services.import-export')", $routes);
        foreach (['services.import-export.analyze', 'services.import-export.create', 'services.import-export.update', 'services.export-json', 'services.export-package'] as $routeName) {
            $this->assertStringContainsString($routeName, $page);
        }
        $this->assertStringContainsString('analysis.plan.can_apply', $page);
        $this->assertStringContainsString('Toute confirmation relance une validation backend complète', $page);
    }

    public function test_analysis_upload_returns_to_canonical_page_and_non_admin_is_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $client = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $json = json_encode([
            'schema_version' => '1.0', 'type' => 'service', 'exported_at' => now()->toIso8601String(),
            'data' => ['name' => 'Nouveau', 'slug' => 'nouveau'],
        ], JSON_THROW_ON_ERROR);

        $response = $this->actingAs($admin)->post(route('services.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('service.json', $json),
        ]);
        $response->assertRedirect(route('services.import-export'));
        $this->followRedirects($response)->assertInertia(fn (Assert $page) => $page
            ->where('analysis.status', 'new')
            ->where('analysis.plan.service.action', 'CREATE'));

        $this->actingAs($client)->post(route('services.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('service.json', $json),
        ])->assertForbidden();
    }

    public function test_confirmation_endpoint_revalidates_instead_of_trusting_frontend_plan(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $json = json_encode([
            'schema_version' => '1.0', 'type' => 'service', 'exported_at' => now()->toIso8601String(),
            'data' => ['name' => 'Nouveau', 'slug' => 'nouveau', 'payment_id' => 'forbidden'],
        ], JSON_THROW_ON_ERROR);

        $this->actingAs($admin)->post(route('services.import-export.create'), [
            'file' => UploadedFile::fake()->createWithContent('service.json', $json),
            'plan' => ['service' => ['action' => 'CREATE'], 'can_apply' => true],
        ])->assertSessionHasErrors('file');
        $this->assertDatabaseMissing('services', ['slug' => 'nouveau']);
    }
}
