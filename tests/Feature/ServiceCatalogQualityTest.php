<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Service;
use Database\Seeders\ServiceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceCatalogQualityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([OnlyTestUsers::class]);
        $this->seed(ServiceSeeder::class);
    }

    public function test_seeded_services_have_complete_editorial_content(): void
    {
        $services = Service::orderBy('id')->get();

        $this->assertCount(6, $services);

        foreach ($services as $service) {
            $this->assertNotEmpty($service->excerpt);
            $this->assertGreaterThan(200, mb_strlen(strip_tags($service->content)));
            $this->assertNotEmpty($service->tagline);
            $this->assertNotEmpty($service->featured_note);
            $this->assertCount(3, $service->ideal_for);
            $this->assertSame('Faire une demande', $service->cta_primary_label);
            $this->assertSame('Découvrir le service', $service->cta_secondary_label);
        }

        $conference = Service::where('slug', 'conferences-workshops')->firstOrFail();
        $this->assertSame('Conférences et ateliers', $conference->name);
    }

    public function test_service_routes_expose_configurable_request_ctas(): void
    {
        $service = Service::where('slug', 'coaching-individuel')->firstOrFail();

        $this->get(route('services'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/services/index')
                ->has('services', 6)
            );

        $this->get(route('services.details', $service->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/services/show')
                ->where('service.cta_primary_label', 'Faire une demande')
            );

        $this->get(route('services.requests', $service->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/services/request')
                ->where('service.id', $service->id)
            );
    }

    public function test_service_detail_component_has_a_permanent_fallback_and_request_wording(): void
    {
        $component = file_get_contents(resource_path('js/Pages/Frontend/services/show.tsx'));

        $this->assertIsString($component);
        $this->assertStringNotContainsString('à venir prochainement', $component);
        $this->assertStringContainsString("'Faire une demande'", $component);
        $this->assertStringContainsString('service.excerpt', $component);
    }

    public function test_seeded_catalog_supports_each_visible_focus(): void
    {
        $filterSource = file_get_contents(resource_path('js/lib/service-focus.ts'));

        $this->assertIsString($filterSource);
        foreach (['coaching', 'consultation', 'formation', 'team_building', 'webinaire', 'ressources'] as $focus) {
            $this->assertStringContainsString("{$focus}:", $filterSource);
        }

        foreach (['coaching-d-equipe', 'accompagnement-entrepreneurial', 'conferences-workshops', 'bilan-de-competences'] as $slug) {
            $this->assertStringContainsString($slug, $filterSource);
        }
    }

    public function test_seeded_services_have_distinct_concise_catalog_promises(): void
    {
        $expectedTaglines = [
            'coaching-individuel' => 'Retrouvez vos repères et passez à l’action.',
            'coaching-d-equipe' => 'Donnez à votre équipe un cap commun et les moyens de mieux coopérer.',
            'developpement-du-leadership' => 'Décidez avec cohérence et mobilisez avec justesse.',
            'accompagnement-entrepreneurial' => 'Transformez vos priorités en décisions et en actions.',
            'bilan-de-competences' => 'Faites de votre parcours un point d’appui pour la suite.',
            'conferences-workshops' => 'Faites émerger des idées qui mobilisent et mettent en mouvement.',
        ];

        foreach ($expectedTaglines as $slug => $tagline) {
            $service = Service::where('slug', $slug)->firstOrFail();

            $this->assertSame($tagline, $service->tagline);
            $this->assertLessThanOrEqual(160, mb_strlen($service->excerpt));
            $this->assertCount(3, $service->ideal_for);
        }
    }

    public function test_service_seeder_preserves_existing_administered_content(): void
    {
        $service = Service::where('slug', 'coaching-individuel')->firstOrFail();
        $service->update([
            'tagline' => 'Contenu administré',
            'excerpt' => 'Extrait administré',
        ]);

        $this->seed(ServiceSeeder::class);

        $service->refresh();
        $this->assertSame('Contenu administré', $service->tagline);
        $this->assertSame('Extrait administré', $service->excerpt);
    }
}
