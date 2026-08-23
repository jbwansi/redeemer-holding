<?php

namespace Tests\Feature\Admin;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceJsonExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_exports_portable_unicode_service_without_sensitive_or_transactional_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $service = Service::create([
            'user_id' => $admin->id,
            'name' => 'Coaching d’équipe',
            'slug' => 'coaching-equipe',
            'excerpt' => 'Résumé à Genève',
            'content' => '<p>Contenu éditorial</p>',
            'icon' => 'users',
            'image' => '/storage/services/equipe.webp',
            'views' => 42,
            'tagline' => 'Accroche',
            'featured_note' => 'Note',
            'ideal_for' => ['Clarifier', 'Agir'],
            'cta_primary_label' => 'Demander',
            'cta_primary_url' => '/contact',
            'cta_secondary_label' => 'Découvrir',
            'cta_secondary_url' => 'https://example.test/service',
            'status' => true,
            'position' => 1,
            'is_featured' => true,
            'featured_badge' => 'Choix',
            'featured_order' => 2,
        ]);
        ServiceRequest::create([
            'service_id' => $service->id, 'first_name' => 'Privé', 'last_name' => 'Client',
            'email' => 'private@example.test', 'payment_id' => 'secret-payment',
        ]);

        $response = $this->actingAs($admin)->get(route('services.export-json', $service));
        $response->assertOk()->assertDownload('redeemer-service-coaching-equipe.json');
        $json = $response->streamedContent();
        $document = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame('1.0', $document['schema_version']);
        $this->assertSame('service', $document['type']);
        $this->assertSame('Coaching d’équipe', $document['data']['name']);
        $this->assertSame(['disk' => 'public', 'path' => 'services/equipe.webp'], $document['data']['image']);
        $this->assertSame(['label' => 'Demander', 'url' => '/contact'], $document['data']['cta_primary']);
        $this->assertSame(1, $document['data']['publication']['position']);
        foreach (['id', 'user_id', 'views', 'created_at', 'updated_at', 'service_requests', 'testimonials', 'payment_id'] as $excluded) {
            $this->assertStringNotContainsString('"'.$excluded.'"', $json);
        }
        $this->assertStringNotContainsString('private@example.test', $json);
        $this->assertStringNotContainsString('secret-payment', $json);
        $this->assertStringContainsString('équipe', $json);
    }

    public function test_non_admin_cannot_export_service(): void
    {
        $service = Service::create(['name' => 'Service', 'slug' => 'service']);
        $client = User::factory()->create(['role' => 'client', 'is_active' => true]);

        $this->actingAs($client)->get(route('services.export-json', $service))->assertForbidden();
    }
}
