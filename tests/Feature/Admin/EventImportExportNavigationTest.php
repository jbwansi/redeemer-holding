<?php

namespace Tests\Feature\Admin;

use Tests\TestCase;

class EventImportExportNavigationTest extends TestCase
{
    public function test_event_import_export_is_in_shared_backend_navigation(): void
    {
        $routes = file_get_contents(resource_path('js/lib/routes.ts'));
        $sidebar = file_get_contents(resource_path('js/components/layouts/dashboard/app-sidebar.tsx'));
        $navbar = file_get_contents(resource_path('js/components/layouts/dashboard/navbar.tsx'));

        $this->assertSame(1, substr_count($routes, "route('events.import-export')"));
        $this->assertStringContainsString("title: 'Import / Export'", $routes);
        $this->assertStringContainsString('dataRoutes.navMain', $sidebar);
        $this->assertStringContainsString('dataRoutes.navMain', $navbar);
    }

    public function test_event_page_follows_training_import_export_structure(): void
    {
        $eventPage = file_get_contents(resource_path('js/src/backend/events/import-export.tsx'));
        $trainingPage = file_get_contents(resource_path('js/src/backend/trainings/import-export.tsx'));

        foreach (['space-y-8 p-4 md:p-8', 'max-w-2xl border-slate-200/80', 'Exporter un événement', 'Importer un événement', 'Exporter en JSON', 'Analyser le fichier'] as $expected) {
            $this->assertStringContainsString($expected, $eventPage);
        }
        foreach (['space-y-8 p-4 md:p-8', 'max-w-2xl border-slate-200/80'] as $sharedClass) {
            $this->assertStringContainsString($sharedClass, $trainingPage);
        }
        $this->assertStringContainsString("route('events.export-json'", $eventPage);
        $this->assertStringContainsString("route('events.export-package'", $eventPage);
        $this->assertStringContainsString('Exporter avec médias (ZIP)', $eventPage);
        $this->assertStringContainsString('.json,.zip,application/json,application/zip', $eventPage);
    }
}
