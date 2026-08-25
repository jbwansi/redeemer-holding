<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceAudienceFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_exposes_every_active_service_and_both_audience_flags(): void
    {
        $individual = $this->service('Coaching organisation trompeur', 'offre-individuelle', true, false);
        $organization = $this->service('Coaching individuel trompeur', 'offre-entreprise', false, true);
        $both = $this->service('Deux publics', 'deux-publics', true, true);
        $uncategorized = $this->service('Non catégorisé', 'non-categorise');
        $this->service('Inactif', 'inactif', true, true, false);

        $this->get(route('services'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Frontend/services/index')
            ->has('services', 4)
            ->where('services.0.id', $individual->id)
            ->where('services.0.is_for_individuals', true)
            ->where('services.0.is_for_organizations', false)
            ->where('services.1.id', $organization->id)
            ->where('services.2.id', $both->id)
            ->where('services.2.is_for_individuals', true)
            ->where('services.2.is_for_organizations', true)
            ->where('services.3.id', $uncategorized->id)
            ->where('services.3.is_for_individuals', false)
            ->where('services.3.is_for_organizations', false));
    }

    public function test_audience_and_legacy_focus_urls_remain_valid(): void
    {
        $this->service('Coaching', 'coaching', true);

        foreach ([
            ['audience' => 'individual'],
            ['audience' => 'organization'],
            ['audience' => 'organization', 'focus' => 'coaching'],
            ['focus' => 'coaching'],
            ['audience' => 'valeur-invalide'],
        ] as $query) {
            $this->get(route('services', $query))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page->component('Frontend/services/index'));
        }
    }

    public function test_component_combines_filters_and_preserves_each_query_dimension(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Frontend/services/index.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString("type ServiceAudience = 'all' | 'individual' | 'organization'", $source);
        $this->assertStringContainsString("service.is_for_individuals === true", $source);
        $this->assertStringContainsString("service.is_for_organizations === true", $source);
        $this->assertStringContainsString('matchesAudience && serviceMatchesFocus(service, focus)', $source);
        $this->assertStringContainsString("updateFilters(item.key as ServiceAudience, focus)", $source);
        $this->assertStringContainsString("updateFilters(audience, item.key as ServiceFocus)", $source);
        $this->assertStringContainsString("updateFilters('all', 'all')", $source);
        $this->assertStringContainsString('aria-pressed={audience === item.key}', $source);
        $this->assertStringContainsString('aria-pressed={focus === item.key}', $source);
        $this->assertStringContainsString('Aucun accompagnement ne correspond à ces critères', $source);
        $this->assertStringNotContainsString('audienceKeywords', $source);
    }

    private function service(
        string $name,
        string $slug,
        bool $individuals = false,
        bool $organizations = false,
        bool $active = true,
    ): Service {
        return Service::create([
            'name' => $name,
            'slug' => $slug,
            'status' => $active,
            'is_for_individuals' => $individuals,
            'is_for_organizations' => $organizations,
        ]);
    }
}
