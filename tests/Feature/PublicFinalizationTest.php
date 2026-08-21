<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicFinalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_contact_hides_calendly_action_when_no_valid_url_is_configured(): void
    {
        $source = $this->frontend('contact.tsx');

        $this->assertStringContainsString('settings.calendly_link.trim()', $source);
        $this->assertStringContainsString('{calendlyLink && <motion.div', $source);
        $this->assertStringContainsString('href={calendlyLink}', $source);
        $this->assertStringNotContainsString('href={settings?.calendly_link}', $source);
    }

    public function test_contact_keeps_configured_calendly_as_an_external_link(): void
    {
        $source = $this->frontend('contact.tsx');

        $this->assertStringContainsString('target="_blank"', $source);
        $this->assertStringContainsString('rel="noopener noreferrer"', $source);
        $this->assertStringContainsString('href={calendlyLink}', $source);
    }

    public function test_unverified_numeric_social_proof_is_absent(): void
    {
        foreach ([
            resource_path('js/Pages/Frontend/contact.tsx'),
            resource_path('js/src/backend/contact/edit.tsx'),
            app_path('Http/Controllers/Admin/ContactController.php'),
        ] as $path) {
            $this->assertStringNotContainsString('Plus de 300 accompagnements', file_get_contents($path));
        }
    }

    public function test_auth_pages_are_noindex_in_initial_html(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertSee('<meta name="robots" content="noindex, follow">', false);

        $this->get('/inscription')
            ->assertOk()
            ->assertSee('<meta name="robots" content="noindex, follow">', false);
    }

    public function test_error_pages_are_noindex_and_404_is_autonomous(): void
    {
        foreach (['403', '404', '419', '500', '503'] as $status) {
            $source = file_get_contents(resource_path("views/errors/{$status}.blade.php"));
            $this->assertStringContainsString('<meta name="robots" content="noindex, follow">', $source);
        }

        $notFound = file_get_contents(resource_path('views/errors/404.blade.php'));
        $this->assertStringNotContainsString('cdn.tailwindcss.com', $notFound);
        $this->assertStringNotContainsString('fonts.bunny.net', $notFound);
        $this->assertStringNotContainsString('<script', $notFound);

        $this->get('/page-absente-a2-4-3')
            ->assertNotFound()
            ->assertSee('noindex, follow', false)
            ->assertSee('Transformer par les valeurs');
    }

    public function test_service_without_slug_never_generates_a_hash_link(): void
    {
        $source = $this->frontend('services/index.tsx')
            .file_get_contents(resource_path('js/components/frontend/services/service-card.tsx'));

        $this->assertStringNotContainsString(": '#')", $source);
        $this->assertStringContainsString(': null;', $source);
        $this->assertStringContainsString('{primaryHref && (', $source);
        $this->assertStringContainsString('{secondaryHref && (', $source);
    }

    public function test_targeted_sources_contain_no_intrainings_typo(): void
    {
        $paths = [
            resource_path('views/emails/welcome.blade.php'),
            resource_path('js/src/backend/users/edit.tsx'),
            resource_path('js/src/backend/pages/edit.tsx'),
            resource_path('js/src/backend/config/activation.tsx'),
            resource_path('js/src/backend/blogs/posts/edit.tsx'),
            resource_path('js/src/backend/events/edit.tsx'),
            resource_path('js/src/backend/events/create.tsx'),
            resource_path('js/src/backend/account/index.tsx'),
            resource_path('js/src/backend/account/banned.tsx'),
            resource_path('js/components/partials/post-form.tsx'),
        ];

        foreach ($paths as $path) {
            $this->assertStringNotContainsString('intrainings', file_get_contents($path), $path);
        }
    }

    private function frontend(string $path): string
    {
        return file_get_contents(resource_path('js/Pages/Frontend/'.$path));
    }
}
