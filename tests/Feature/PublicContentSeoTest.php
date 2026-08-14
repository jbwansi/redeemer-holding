<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicContentSeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([OnlyTestUsers::class]);
    }

    public function test_service_detail_seo_prefers_excerpt(): void
    {
        $service = Service::create([
            'name' => 'Accompagnement stratégique',
            'slug' => 'accompagnement-strategique',
            'excerpt' => 'Une description concise issue de l’extrait du service.',
            'content' => '<p>Un contenu détaillé qui ne doit pas remplacer l’extrait.</p>',
            'status' => true,
        ]);

        $this->get(route('services.details', $service->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Frontend/services/show')
                ->where('seo.description', 'Une description concise issue de l’extrait du service.')
            );
    }

    public function test_service_detail_seo_uses_plain_text_content_when_excerpt_is_missing(): void
    {
        $service = Service::create([
            'name' => 'Conseil aux organisations',
            'slug' => 'conseil-organisations',
            'content' => '<p>Une expertise <strong>humaine</strong> pour guider vos décisions.</p>',
            'status' => true,
        ]);

        $this->get(route('services.details', $service->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('seo.description', 'Une expertise humaine pour guider vos décisions.')
            );
    }

    public function test_contact_and_legal_pages_remain_publicly_accessible(): void
    {
        foreach (['/contact', '/termes-et-conditions', '/politique-de-confidentialite', '/politique-des-cookies'] as $uri) {
            $this->get($uri)->assertOk();
        }
    }
}
