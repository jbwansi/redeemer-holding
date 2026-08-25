<?php

namespace Tests\Feature\Admin;

use Tests\TestCase;

class ServiceIconRegistryTest extends TestCase
{
    public function test_registry_is_centralized_complete_and_has_no_duplicate_names(): void
    {
        $registry = file_get_contents(resource_path('js/lib/service-icon-registry.ts'));

        $this->assertIsString($registry);
        preg_match_all("/icon\('([^']+)',\s*'[^']+',\s*'[^']+',\s*([A-Za-z0-9]+)/", $registry, $matches);

        $names = $matches[1];
        $components = $matches[2];
        $this->assertCount(54, $names);
        $this->assertCount(count($names), array_unique($names));

        foreach ($components as $component) {
            $this->assertMatchesRegularExpression('/\b'.preg_quote($component, '/').'\b/', $registry);
        }

        foreach ([
            'userRound', 'users', 'userCheck', 'handshake', 'heartHandshake', 'messageCircle',
            'messagesSquare', 'briefcase', 'building2', 'graduationCap', 'bookOpen',
            'presentation', 'mic', 'compass', 'map', 'route', 'flag', 'target', 'rocket',
            'trendingUp', 'lightbulb', 'brain', 'puzzle', 'award', 'trophy', 'medal',
            'palette', 'penTool', 'sparkles', 'laptop', 'code2', 'database', 'globe',
            'shieldCheck', 'heart', 'leaf', 'sprout',
        ] as $requiredName) {
            $this->assertContains($requiredName, $names);
        }
    }

    public function test_registry_contains_the_eight_requested_categories_and_search_metadata(): void
    {
        $registry = file_get_contents(resource_path('js/lib/service-icon-registry.ts'));

        foreach ([
            'Coaching et accompagnement',
            'Équipes et organisations',
            'Formation et apprentissage',
            'Stratégie et performance',
            'Communication et créativité',
            'Carrière et orientation',
            'Numérique et technologie',
            'Valeurs et bien-être',
        ] as $category) {
            $this->assertStringContainsString("'{$category}'", $registry);
        }

        preg_match_all(
            "/icon\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*[A-Za-z0-9]+,\s*\[([^\]]*)\]\)/s",
            $registry,
            $entries,
            PREG_SET_ORDER,
        );

        $search = function (string $query) use ($entries): array {
            $normalize = fn (string $value): string => strtolower(
                iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value
            );
            $needle = $normalize($query);

            return array_values(array_map(
                fn (array $entry): string => $entry[1],
                array_filter($entries, fn (array $entry): bool => str_contains(
                    $normalize(implode(' ', [$entry[1], $entry[2], $entry[3], $entry[4]])),
                    $needle,
                )),
            ));
        };

        $this->assertContains('users', $search('équipe'));
        $this->assertContains('handshake', $search('équipe'));
        $this->assertContains('heartHandshake', $search('équipe'));
        $this->assertContains('graduationCap', $search('formation'));
        $this->assertContains('bookOpen', $search('formation'));
        $this->assertContains('presentation', $search('formation'));
        $this->assertContains('compass', $search('orientation'));
        $this->assertContains('map', $search('orientation'));
        $this->assertContains('route', $search('orientation'));
        $this->assertStringContainsString(".normalize('NFD')", $registry);
        $this->assertStringContainsString('[entry.name, entry.label, entry.category, ...entry.keywords]', $registry);
    }

    public function test_picker_supports_search_category_selection_removal_and_accessibility(): void
    {
        $picker = file_get_contents(resource_path('js/components/ui/IconPicker.tsx'));

        $this->assertStringContainsString('filterServiceIcons(query, category)', $picker);
        $this->assertStringContainsString('SERVICE_ICON_CATEGORIES.map', $picker);
        $this->assertStringContainsString('type="search"', $picker);
        $this->assertStringContainsString("onClick={() => onChange(entry.name)}", $picker);
        $this->assertStringContainsString("onClick={() => onChange('')}", $picker);
        $this->assertStringContainsString('Retirer l’icône', $picker);
        $this->assertStringContainsString('aria-pressed={selected}', $picker);
        $this->assertStringContainsString('aria-label={`${entry.label} — ${entry.category}`}', $picker);
        $this->assertStringContainsString('focus-visible:ring-2', $picker);
        $this->assertStringContainsString('Cette ancienne valeur est conservée', $picker);
    }

    public function test_public_renderer_keeps_legacy_normalization_and_fallback(): void
    {
        $normalizer = file_get_contents(resource_path('js/lib/service-icon.ts'));
        $renderer = file_get_contents(resource_path('js/components/ui/icon.tsx'));

        $this->assertStringContainsString('LEGACY_ICON_ALIASES', $normalizer);
        $this->assertStringContainsString('findServiceIcon(candidate)', $normalizer);
        $this->assertStringContainsString('candidate in dynamicIconImports', $normalizer);
        $this->assertStringContainsString('findServiceIcon(name)', $renderer);
        $this->assertStringContainsString('return <Package', $renderer);
    }
}
