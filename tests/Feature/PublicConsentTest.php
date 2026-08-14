<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicConsentTest extends TestCase
{
    public function test_blade_layouts_do_not_load_google_analytics_before_consent(): void
    {
        foreach (['app.blade.php', 'welcome.blade.php', 'maintenance.blade.php'] as $view) {
            $source = file_get_contents(resource_path('views/' . $view));
            $this->assertStringNotContainsString('googletagmanager.com/gtag/js', $source);
            $this->assertStringNotContainsString("gtag('config'", $source);
        }
    }

    public function test_analytics_loader_requires_explicit_analytics_consent(): void
    {
        $source = $this->source('components/frontend/consent/cookie-consent-provider.tsx');

        $this->assertStringContainsString('applyAnalyticsConsent(consent?.analytics === true)', $source);
        $this->assertStringContainsString('if (!enabled || document.getElementById', $source);
        $this->assertStringContainsString('https://www.googletagmanager.com/gtag/js?id=', $source);
        $this->assertStringContainsString('window[`ga-disable-${ANALYTICS_ID}`] = !enabled', $source);
    }

    public function test_consent_categories_are_independent_and_persisted(): void
    {
        $provider = $this->source('components/frontend/consent/cookie-consent-provider.tsx');
        $storage = $this->source('lib/cookie-consent.ts');

        $this->assertStringContainsString("redeemer_cookie_consent_v1", $storage);
        $this->assertStringContainsString('window.localStorage.setItem', $storage);
        $this->assertStringContainsString('analytics: preferences.analytics', $storage);
        $this->assertStringContainsString('externalMedia: preferences.externalMedia', $storage);
        $this->assertStringContainsString('save(consent?.analytics ?? false, true)', $provider);
    }

    public function test_external_video_iframe_is_guarded_by_media_consent(): void
    {
        $source = $this->source('components/frontend/home/welcome-video.tsx');

        $guard = strpos($source, 'consent?.externalMedia ?');
        $iframe = strpos($source, '<iframe');
        $placeholder = strpos($source, 'Autoriser et charger la vidéo');

        $this->assertNotFalse($guard);
        $this->assertNotFalse($iframe);
        $this->assertNotFalse($placeholder);
        $this->assertLessThan($iframe, $guard);
    }

    public function test_banner_offers_equal_choices_and_footer_reopens_preferences(): void
    {
        $provider = $this->source('components/frontend/consent/cookie-consent-provider.tsx');
        $footer = $this->source('components/frontend/layouts/footer.tsx');

        $this->assertStringContainsString('Tout accepter', $provider);
        $this->assertStringContainsString('Refuser les optionnels', $provider);
        $this->assertStringContainsString('Personnaliser', $provider);
        $this->assertStringContainsString('Analytics', $provider);
        $this->assertStringContainsString('Médias externes', $provider);
        $this->assertStringContainsString('onClick={openPreferences}', $footer);
        $this->assertStringContainsString('Gérer mes cookies', $footer);
    }

    public function test_public_legal_pages_have_clean_copy_and_a_stable_date(): void
    {
        foreach (['policy.tsx', 'terms.tsx', 'cookies.tsx'] as $page) {
            $source = $this->source('Pages/Frontend/policies/' . $page);
            $this->assertStringNotContainsString('intrainings', $source);
            $this->assertStringNotContainsString('new Date().toLocaleDateString', $source);
            $this->assertStringContainsString('LEGAL_LAST_UPDATED', $source);
        }

        $this->assertStringContainsString('14 août 2026', $this->source('lib/legal.ts'));
    }

    public function test_public_frontend_uses_no_remote_google_font(): void
    {
        $layout = file_get_contents(resource_path('views/app.blade.php'));
        $css = file_get_contents(resource_path('css/app.css'));

        $this->assertStringNotContainsString('fonts.googleapis.com', $layout);
        $this->assertStringNotContainsString('fonts.gstatic.com', $layout);
        $this->assertStringContainsString('system-ui', $css);
    }

    private function source(string $path): string
    {
        return file_get_contents(resource_path('js/' . $path));
    }
}
