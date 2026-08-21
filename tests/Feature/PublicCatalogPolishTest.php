<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicCatalogPolishTest extends TestCase
{
    public function test_public_identity_fallbacks_include_the_official_slogan(): void
    {
        foreach ([
            resource_path('js/Pages/Frontend/home.tsx'),
            resource_path('js/components/frontend/home/hero.tsx'),
            resource_path('js/Pages/Frontend/about.tsx'),
            resource_path('js/components/frontend/layouts/footer.tsx'),
        ] as $source) {
            $this->assertStringContainsString('Transformer par les valeurs', file_get_contents($source));
        }
    }

    public function test_catalog_pagination_keeps_active_filters(): void
    {
        $utility = file_get_contents(resource_path('js/lib/catalog-filters.ts'));

        $this->assertStringContainsString('new URLSearchParams(window.location.search)', $utility);
        $this->assertStringContainsString('filters: Record<string, string | boolean | null>', $utility);

        $catalogs = [
            'trainings/index.tsx' => ['search', 'past'],
            'events/index.tsx' => ['search', 'category', 'past'],
            'blogs/index.tsx' => ['search', 'category', 'tag'],
        ];

        foreach ($catalogs as $catalog => $filters) {
            $source = file_get_contents(resource_path("js/Pages/Frontend/{$catalog}"));
            $this->assertStringContainsString('catalogPageParams(currentPage - 1', $source);
            $this->assertStringContainsString('catalogPageParams(currentPage + 1', $source);

            foreach ($filters as $filter) {
                $this->assertStringContainsString($filter, $source);
            }
        }
    }

    public function test_public_training_seed_does_not_promise_an_inactive_certificate(): void
    {
        $seed = file_get_contents(database_path('seeders/TrainingSeeder.php'));

        $this->assertStringNotContainsString('Certificat de completion', $seed);
        $this->assertStringContainsString('Ressources de synthèse', $seed);
    }

    public function test_catalog_search_fields_have_accessible_labels(): void
    {
        foreach (['training-search', 'event-search', 'blog-search'] as $id) {
            $sources = glob(resource_path('js/Pages/Frontend/*/index.tsx'));
            $combined = implode("\n", array_map('file_get_contents', $sources));

            $this->assertStringContainsString("htmlFor=\"{$id}\"", $combined);
            $this->assertStringContainsString("id=\"{$id}\"", $combined);
        }
    }

    public function test_service_catalog_cards_keep_a_compact_vertical_structure(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Frontend/services/index.tsx'))
            .file_get_contents(resource_path('js/components/frontend/services/service-card.tsx'));

        $this->assertStringContainsString('flex h-full flex-col', $source);
        $this->assertStringContainsString('aspect-[16/9]', $source);
        $this->assertStringContainsString('service.excerpt', $source);
        $this->assertStringContainsString('line-clamp-4', $source);
        $this->assertStringContainsString('service.ideal_for.filter(Boolean).slice(0, 3)', $source);
        $this->assertStringContainsString('idealFor.length > 0', $source);
        $this->assertStringContainsString("'Faire une demande'", $source);
        $this->assertStringContainsString("'En savoir plus'", $source);
        $this->assertStringNotContainsString('service.content', $source);
        $this->assertStringNotContainsString('lg:grid-cols-[1.05fr_0.95fr]', $source);
    }
}
