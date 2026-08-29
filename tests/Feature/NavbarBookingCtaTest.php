<?php

namespace Tests\Feature;

use Tests\TestCase;

class NavbarBookingCtaTest extends TestCase
{
    public function test_navigation_uses_configured_booking_url_with_contact_fallback(): void
    {
        $source = file_get_contents(resource_path('js/components/frontend/layouts/navbar.tsx'));

        $this->assertStringContainsString('settings?.calendly_link', $source);
        $this->assertStringContainsString("const bookingHref = configuredBookingUrl || route('contact')", $source);
        $this->assertStringContainsString('href={bookingHref}', $source);
        $this->assertStringContainsString('target={hasConfiguredBookingUrl', $source);
        $this->assertStringContainsString("'noopener noreferrer'", $source);
    }

    public function test_desktop_and_mobile_expose_primary_booking_cta_and_mobile_keeps_contact(): void
    {
        $source = file_get_contents(resource_path('js/components/frontend/layouts/navbar.tsx'));

        $this->assertSame(2, substr_count($source, 'aria-label="Prendre rendez-vous"'));
        $this->assertStringContainsString('lg:inline-flex', $source);
        $this->assertStringContainsString('ux-btn-primary w-full', $source);
        $this->assertStringContainsString("href={route('contact')}", $source);
        $this->assertStringNotContainsString("name: 'Contact'", $source);
    }

    public function test_mobile_hero_padding_clears_the_fixed_header(): void
    {
        $source = file_get_contents(resource_path('js/components/frontend/home/hero.tsx'));

        $this->assertStringContainsString('pb-10 pt-28 text-gray-900', $source);
        $this->assertStringContainsString('md:pb-12 md:pt-24', $source);
    }
}
