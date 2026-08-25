<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceDetailCtaTest extends TestCase
{
    use RefreshDatabase;

    public function test_detail_page_exposes_audience_fields_and_administrable_cta(): void
    {
        $service = Service::create([
            'name' => 'Service test',
            'slug' => 'service-test',
            'status' => true,
            'is_for_individuals' => true,
            'is_for_organizations' => false,
            'cta_primary_label' => 'Libellé administré',
            'cta_primary_url' => '/destination-administree',
        ]);

        $this->get(route('services.details', $service->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/services/show')
                ->where('service.is_for_individuals', true)
                ->where('service.is_for_organizations', false)
                ->where('service.cta_primary_label', 'Libellé administré')
                ->where('service.cta_primary_url', '/destination-administree'));
    }

    public function test_detail_component_resolves_labels_only_from_audience_flags(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Frontend/services/show.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('service.is_for_individuals', $source);
        $this->assertStringContainsString('service.is_for_organizations', $source);
        $this->assertStringContainsString("'Réserver un échange'", $source);
        $this->assertStringContainsString("'Échanger sur votre besoin'", $source);
        $this->assertStringContainsString("'Prendre rendez-vous'", $source);
        $this->assertStringContainsString("service.cta_primary_label || 'Faire une demande'", $source);
        $this->assertStringNotContainsString('service.name.includes', $source);
        $this->assertStringNotContainsString('service.slug.includes', $source);
    }

    public function test_hero_sidebar_and_final_section_share_one_cta_destination_and_label(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Frontend/services/show.tsx'));

        $this->assertIsString($source);
        $this->assertSame(3, substr_count($source, 'href={primaryCtaUrl}'));
        $this->assertSame(3, substr_count($source, '{primaryCtaLabel}'));
        $this->assertStringNotContainsString('En savoir plus', $source);
        $this->assertStringNotContainsString('secondaryCtaLabel', $source);
        $this->assertStringNotContainsString('secondaryCtaUrl', $source);
    }
}
