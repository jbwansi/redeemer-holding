<?php

namespace Tests\Feature;

use Tests\TestCase;

class HomeHeroCompositionTest extends TestCase
{
    public function test_hero_keeps_dynamic_carousel_and_uses_compact_horizontal_composition(): void
    {
        $source = file_get_contents(resource_path('js/components/frontend/home/hero.tsx'));

        $this->assertStringContainsString("setInterval(() =>", $source);
        $this->assertStringContainsString('images[currentIndex]', $source);
        $this->assertStringContainsString('images.map((_, index)', $source);
        $this->assertStringContainsString('md:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]', $source);
        $this->assertStringContainsString('className="order-1 min-w-0"', $source);
        $this->assertStringContainsString('className="order-2 min-w-0"', $source);
        $this->assertStringContainsString('md:h-[420px] lg:h-[450px]', $source);
        $this->assertStringNotContainsString('min-h-screen', $source);
        $this->assertStringNotContainsString('h-screen', $source);
    }

    public function test_hero_decoration_and_satisfaction_badge_are_accessible_and_data_driven(): void
    {
        $source = file_get_contents(resource_path('js/components/frontend/home/hero.tsx'));

        $this->assertStringContainsString('aria-hidden="true"', $source);
        $this->assertStringContainsString('hidden h-[88%]', $source);
        $this->assertStringContainsString('{floatingStatValue}', $source);
        $this->assertStringContainsString('{floatingStatLabel}', $source);
        $this->assertStringContainsString('rounded-full border-2 border-[#DA2E29]/80', $source);
        $this->assertStringNotContainsString('avatar', strtolower($source));
    }
}
