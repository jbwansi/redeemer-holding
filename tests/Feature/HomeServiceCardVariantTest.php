<?php

namespace Tests\Feature;

use Tests\TestCase;

class HomeServiceCardVariantTest extends TestCase
{
    public function test_home_explicitly_uses_the_compact_variant_and_audience(): void
    {
        $homeServices = file_get_contents(resource_path('js/components/frontend/home/services.tsx'));

        $this->assertIsString($homeServices);
        $this->assertSame(1, substr_count($homeServices, '<ServiceCard'));
        $this->assertStringContainsString('variant="compact"', $homeServices);
        $this->assertStringContainsString('audience={visibleAudience}', $homeServices);
        $this->assertStringContainsString("useState<Audience>('individual')", $homeServices);
        $this->assertStringContainsString("visibleServices.length === 1", $homeServices);
        $this->assertStringContainsString("visibleServices.length === 2", $homeServices);
        $this->assertStringContainsString("'mx-auto max-w-md grid-cols-1'", $homeServices);
        $this->assertStringContainsString("'mx-auto max-w-4xl grid-cols-1 md:grid-cols-2'", $homeServices);
        $this->assertStringContainsString("'mx-auto max-w-7xl grid-cols-1 md:grid-cols-2 xl:grid-cols-3'", $homeServices);
        $this->assertStringNotContainsString('service.name.includes', $homeServices);
        $this->assertStringNotContainsString('service.slug.includes', $homeServices);
    }

    public function test_shared_card_defaults_to_detailed_and_compact_only_changes_presentation(): void
    {
        $card = file_get_contents(resource_path('js/components/frontend/services/service-card.tsx'));

        $this->assertIsString($card);
        $this->assertStringContainsString("variant?: 'compact' | 'detailed'", $card);
        $this->assertStringContainsString("variant = 'detailed'", $card);
        $this->assertStringContainsString("const isCompact = variant === 'compact'", $card);
        $this->assertStringContainsString('{!isCompact && (', $card);
        $this->assertStringContainsString('<div className="relative overflow-visible">', $card);
        $this->assertStringContainsString('imageOpen &&', $card);
        $this->assertStringContainsString('line-clamp-3', $card);
        $this->assertStringContainsString('hasCompleteCompactTagline', $card);
        $this->assertStringContainsString("!compactTagline.endsWith('…')", $card);
        $this->assertStringNotContainsString('idealFor.slice', $card);
        $this->assertStringContainsString('{service.featured_note && (', $card);
        $this->assertStringContainsString('{primaryHref && (', $card);
        $this->assertStringContainsString('{secondaryHref && (', $card);
        $this->assertStringContainsString("route('services.details', service.slug)", $card);
        $this->assertStringContainsString("'Découvrir la solution'", $card);
        $this->assertStringContainsString("'Découvrir l’accompagnement'", $card);
        $this->assertSame(3, substr_count($card, '<Link'));
    }

    public function test_services_page_keeps_the_implicit_detailed_variant(): void
    {
        $servicesPage = file_get_contents(resource_path('js/Pages/Frontend/services/index.tsx'));

        $this->assertIsString($servicesPage);
        $this->assertStringContainsString('<ServiceCard', $servicesPage);
        $this->assertStringNotContainsString('variant="compact"', $servicesPage);
    }

    public function test_home_has_contextual_catalog_ctas_with_filtered_urls(): void
    {
        $homeServices = file_get_contents(resource_path('js/components/frontend/home/services.tsx'));

        $this->assertIsString($homeServices);
        $this->assertStringContainsString('Voir tous les accompagnements individuels', $homeServices);
        $this->assertStringContainsString('Voir toutes les solutions pour entreprises', $homeServices);
        $this->assertStringContainsString("route('services', { audience: visibleAudience })", $homeServices);
        $this->assertStringContainsString("'mx-auto max-w-4xl grid-cols-1 md:grid-cols-2'", $homeServices);
    }
}
