<?php

namespace Tests\Feature\Admin;

use App\Models\Service;
use App\Services\ServiceJsonImportAnalyzer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ServiceJsonImportAnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_slug_is_create_and_analysis_never_writes(): void
    {
        $before = Service::count();
        $result = $this->analyze($this->document(['name' => 'Nouveau', 'slug' => 'nouveau']));

        $this->assertTrue($result['valid']);
        $this->assertSame('new', $result['status']);
        $this->assertSame('CREATE', $result['plan']['service']['action']);
        $this->assertTrue($result['plan']['can_apply']);
        $this->assertSame($before, Service::count());
    }

    public function test_existing_identical_is_unchanged_and_absent_fields_are_preserved(): void
    {
        Service::create(['name' => 'Local', 'slug' => 'local', 'excerpt' => 'À préserver', 'status' => false]);
        $result = $this->analyze($this->document(['name' => 'Local', 'slug' => 'local']));

        $this->assertSame('existing', $result['status']);
        $this->assertSame('UNCHANGED', $result['plan']['service']['action']);
        $this->assertContains('PRESERVE', array_column($result['changes'], 'action'));
        $this->assertSame('PRESERVE', collect($result['changes'])->firstWhere('field', 'excerpt')['action']);
    }

    public function test_difference_is_update_and_null_remains_distinct_from_absence(): void
    {
        Service::create(['name' => 'Local', 'slug' => 'local', 'tagline' => 'Ancienne']);
        $result = $this->analyze($this->document(['slug' => 'local', 'tagline' => null]));

        $this->assertSame('UPDATE', $result['plan']['service']['action']);
        $change = collect($result['changes'])->firstWhere('field', 'tagline');
        $this->assertSame('UPDATE', $change['action']);
        $this->assertNull($change['after']);
        $this->assertSame('PRESERVE', collect($result['changes'])->firstWhere('field', 'excerpt')['action']);
    }

    public function test_unknown_and_recursively_sensitive_keys_are_rejected(): void
    {
        $unknown = $this->analyze($this->document(['name' => 'X', 'slug' => 'x', 'unknown' => true]));
        $sensitive = $this->analyze($this->document([
            'name' => 'X', 'slug' => 'x', 'cta_primary' => ['label' => 'X', 'url' => '/', 'payment_id' => 'secret'],
        ]));

        $this->assertFalse($unknown['valid']);
        $this->assertStringContainsString('n’est pas autorisé', implode(' ', $unknown['errors']));
        $this->assertFalse($sensitive['valid']);
        $this->assertStringContainsString('champ sensible', implode(' ', $sensitive['errors']));
    }

    public function test_cta_ideal_for_image_and_position_rules_are_strict(): void
    {
        foreach ([
            ['cta_primary' => ['url' => 'javascript:alert(1)']],
            ['cta_secondary' => ['url' => '//evil.test/path']],
            ['ideal_for' => ['Valide', '']],
            ['image' => ['disk' => 'local', 'path' => 'services/x.jpg']],
            ['image' => ['disk' => 'public', 'path' => '../x.jpg']],
            ['publication' => ['position' => 4]],
        ] as $invalid) {
            $result = $this->analyze($this->document(['name' => 'X', 'slug' => 'x', ...$invalid]));
            $this->assertFalse($result['valid'], json_encode($invalid));
        }
    }

    public function test_position_conflict_is_ambiguous_and_blocks_application(): void
    {
        Service::create(['name' => 'Occupant', 'slug' => 'occupant', 'position' => 1]);
        $result = $this->analyze($this->document([
            'name' => 'Nouveau', 'slug' => 'nouveau', 'publication' => ['position' => 1],
        ]));

        $this->assertSame('ambiguous', $result['status']);
        $this->assertSame('AMBIGUOUS', $result['plan']['service']['action']);
        $this->assertFalse($result['plan']['can_apply']);
    }

    public function test_json_media_warnings_cover_missing_image_and_local_html_only(): void
    {
        Storage::fake('public');
        $missing = $this->analyze($this->document([
            'name' => 'X', 'slug' => 'x',
            'image' => ['disk' => 'public', 'path' => 'services/missing.jpg'],
            'content' => '<p><img src="/storage/services/inline.jpg"></p>',
        ]));
        Storage::disk('public')->put('services/present.jpg', 'image');
        $present = $this->analyze($this->document([
            'name' => 'Y', 'slug' => 'y', 'image' => ['disk' => 'public', 'path' => 'services/present.jpg'],
        ]));

        $this->assertCount(2, $missing['warnings']);
        $this->assertEmpty($present['warnings']);
    }

    private function analyze(array $document): array
    {
        return app(ServiceJsonImportAnalyzer::class)->analyze(json_encode($document, JSON_THROW_ON_ERROR));
    }

    private function document(array $data): array
    {
        return ['schema_version' => '1.0', 'type' => 'service', 'exported_at' => now()->toIso8601String(), 'data' => $data];
    }
}
