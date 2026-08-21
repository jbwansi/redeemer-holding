<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrainingImportExportWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_ui_distinguishes_new_unchanged_modified_and_ambiguous_workflows(): void
    {
        $source = $this->source();

        $this->assertStringContainsString("safeAnalysis.status === 'new'", $source);
        $this->assertStringContainsString('Créer la formation', $source);
        $this->assertStringContainsString('Cette formation est déjà à jour.', $source);
        $this->assertStringContainsString('safeAnalysis.update_plan.summary.creates === 0', $source);
        $this->assertStringContainsString('safeAnalysis.update_plan.summary.updates === 0', $source);
        $this->assertStringContainsString('Appliquer les modifications', $source);
        $this->assertStringContainsString('Import bloqué', $source);
        $this->assertStringContainsString('Aucune modification n’a été effectuée.', $source);
    }

    public function test_file_is_kept_after_analysis_and_reset_only_after_success_or_explicit_action(): void
    {
        $source = $this->source();
        $analyze = $this->method($source, 'const analyzeFile', 'const clearSelectedFile');

        $this->assertStringNotContainsString("form.reset('file')", $analyze);
        $this->assertStringContainsString('onSuccess: clearSelectedFile', $source);
        $this->assertStringContainsString('const importAnotherFile', $source);
        $this->assertStringContainsString("form.reset('file')", $source);
        $this->assertStringContainsString('form.clearErrors()', $source);
        $this->assertStringContainsString('setShowResults(false)', $source);
        $this->assertStringContainsString('key={fileInputKey}', $source);
    }

    public function test_success_reports_and_format_media_messages_are_present(): void
    {
        $source = $this->source();

        $this->assertStringContainsString('Formation créée avec succès', $source);
        $this->assertStringContainsString('Formation mise à jour avec', $source);
        $this->assertStringContainsString('Supprimés : 0', $source);
        $this->assertStringContainsString('Importer un autre fichier', $source);
        $this->assertStringContainsString('Format JSON 1.0 — mode de compatibilité', $source);
        $this->assertStringContainsString('Format JSON 1.1', $source);
        $this->assertStringContainsString('Références médias détectées', $source);
        $this->assertStringContainsString('mais pas les', $source);
        $this->assertStringContainsString('fichiers physiques eux-mêmes', $source);
        $this->assertStringNotContainsString('.stable_id', $source);
    }

    public function test_action_routes_are_never_used_as_get_navigation_targets(): void
    {
        $source = $this->source();

        $this->assertStringContainsString("form.post(route('trainings.import-export.analyze')", $source);
        $this->assertStringContainsString("form.post(route('trainings.import-export.create')", $source);
        $this->assertStringContainsString("form.post(route('trainings.import-export.update')", $source);
        $this->assertStringNotContainsString("<Link href={route('trainings.import-export.analyze')}", $source);
        $this->assertStringNotContainsString("<Link href={route('trainings.import-export.create')}", $source);
        $this->assertStringNotContainsString("<Link href={route('trainings.import-export.update')}", $source);
    }

    public function test_obsolete_global_import_route_is_absent_and_canonical_page_remains_accessible(): void
    {
        $this->assertFalse(Route::has('trainings.import-json'));
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);

        $this->actingAs($admin)
            ->get(route('trainings.import-export'))
            ->assertOk();
    }

    private function source(): string
    {
        return file_get_contents(resource_path('js/src/backend/trainings/import-export.tsx'));
    }

    private function method(string $source, string $start, string $end): string
    {
        $from = strpos($source, $start);
        $to = strpos($source, $end, $from);

        return substr($source, $from, $to - $from);
    }
}
