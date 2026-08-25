<?php

namespace Tests\Feature;

use Tests\TestCase;

class HomeCompactionTest extends TestCase
{
    public function test_home_uses_one_accessible_audience_selector_and_one_service_card_mapping(): void
    {
        $home = file_get_contents(resource_path('js/Pages/Frontend/home.tsx'));
        $services = file_get_contents(resource_path('js/components/frontend/home/services.tsx'));

        $this->assertSame(1, substr_count($home, '<Services'));
        $this->assertStringContainsString("useState<Audience>('individual')", $services);
        $this->assertStringContainsString('role="tablist"', $services);
        $this->assertStringContainsString('role="tab"', $services);
        $this->assertStringContainsString("role={hasBoth ? 'tabpanel' : undefined}", $services);
        $this->assertStringContainsString('aria-selected={selected}', $services);
        $this->assertStringContainsString('aria-controls=', $services);
        $this->assertStringContainsString("['ArrowLeft', 'ArrowRight', 'Home', 'End']", $services);
        $this->assertSame(1, substr_count($services, '<ServiceCard'));
        $this->assertStringContainsString('hasBoth ? (', $services);
        $this->assertStringContainsString(': fallbackServices', $services);
    }

    public function test_home_removes_redundant_sections_but_keeps_transformation_without_form(): void
    {
        $home = file_get_contents(resource_path('js/Pages/Frontend/home.tsx'));

        $this->assertStringNotContainsString('<ForWhom', $home);
        $this->assertStringNotContainsString('<WelcomeVideo', $home);
        $this->assertStringContainsString('<ClarityActionBlock', $home);
        $this->assertStringContainsString('showForm={false}', $home);
        $this->assertStringContainsString('<StatsBand', $home);
        $this->assertStringContainsString('<TestimonialsSection', $home);
        $this->assertStringContainsString('<CalendlyCTA', $home);
    }

    public function test_compact_sections_use_requested_breakpoints_and_content_limits(): void
    {
        $process = file_get_contents(resource_path('js/components/frontend/home/how-it-works.tsx'));
        $blog = file_get_contents(resource_path('js/components/frontend/home/blog-preview.tsx'));
        $trainings = file_get_contents(resource_path('js/components/frontend/home/featured-trainings.tsx'));

        $this->assertStringContainsString('grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4', $process);
        $this->assertStringContainsString('steps.slice(0, 4)', $process);
        $this->assertStringContainsString('line-clamp-2', $process);
        $this->assertStringContainsString('posts.slice(0, 3)', $blog);
        $this->assertStringContainsString('line-clamp-2', $blog);
        $this->assertStringContainsString('if (!trainings?.length) return null;', $trainings);
    }
}
