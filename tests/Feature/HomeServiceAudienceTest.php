<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeServiceAudienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_separates_audiences_and_a_service_can_belong_to_both(): void
    {
        $individual = $this->service('Individuel', 1, individuals: true);
        $both = $this->service('Deux publics', 2, individuals: true, organizations: true);
        $organization = $this->service('Organisation', 3, organizations: true);
        $this->service('Inactif', 1, active: false, individuals: true, organizations: true);
        $this->service('Non catégorisé', 1);

        $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Frontend/home')
            ->where('services', [])
            ->has('individualServices', 2)
            ->where('individualServices.0.id', $individual->id)
            ->where('individualServices.1.id', $both->id)
            ->has('organizationServices', 2)
            ->where('organizationServices.0.id', $both->id)
            ->where('organizationServices.1.id', $organization->id));
    }

    public function test_home_orders_and_limits_each_audience_to_three_services(): void
    {
        foreach ([4, 2, 1, 3] as $position) {
            $this->service('Individuel '.$position, $position, individuals: true);
            $this->service('Organisation '.$position, $position, organizations: true);
        }

        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->has('individualServices', 3)
            ->where('individualServices.0.position', 1)
            ->where('individualServices.2.position', 3)
            ->has('organizationServices', 3)
            ->where('organizationServices.0.position', 1)
            ->where('organizationServices.2.position', 3));
    }

    public function test_home_uses_legacy_fallback_only_when_no_positioned_service_is_categorized(): void
    {
        $first = $this->service('Historique 1', 1);
        $this->service('Historique 2', 2);
        $this->service('Sans position', null, individuals: true);

        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->has('services', 2)
            ->where('services.0.id', $first->id)
            ->where('individualServices', [])
            ->where('organizationServices', []));
    }

    public function test_home_preserves_administrable_hero_metadata(): void
    {
        Page::create([
            'title' => 'Accueil',
            'slug' => 'accueil',
            'status' => true,
            'meta' => ['hero_title_line1' => 'Titre administré', 'hero_cta_text' => 'CTA administré'],
        ]);

        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->where('home.meta.hero_title_line1', 'Titre administré')
            ->where('home.meta.hero_cta_text', 'CTA administré'));
    }

    private function service(
        string $name,
        ?int $position,
        bool $active = true,
        bool $individuals = false,
        bool $organizations = false,
    ): Service {
        return Service::create([
            'name' => $name,
            'slug' => str($name)->slug().'-'.uniqid(),
            'status' => $active,
            'position' => $position,
            'is_for_individuals' => $individuals,
            'is_for_organizations' => $organizations,
        ]);
    }
}
