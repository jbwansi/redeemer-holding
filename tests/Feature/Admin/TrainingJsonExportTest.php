<?php

namespace Tests\Feature\Admin;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingParticipant;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizQuestion;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class TrainingJsonExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_admin_can_export_complete_training_package_without_sensitive_data(): void
    {
        Carbon::setTestNow('2026-08-21 15:00:00');

        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = Training::create([
            'user_id' => $admin->id,
            'title' => 'Formation Éthique®',
            'slug' => 'formation-ethique',
            'excerpt' => 'Présentation',
            'content' => '<p>Contenu pédagogique</p>',
            'location' => 'Genève',
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonth()->addDay(),
            'price' => 125.50,
            'max_participants' => 12,
            'featured_image' => ['original' => 'trainings/image-éthique.jpg'],
            'tags' => ['éthique', 'führung'],
            'is_published' => true,
            'published_at' => now(),
        ]);
        $section = TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'Module 1',
            'description' => 'Fondamentaux',
            'sort_order' => 2,
            'is_published' => true,
        ]);
        $lesson = TrainingLesson::create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'Leçon 1',
            'slug' => 'lecon-1',
            'content' => 'Apprendre',
            'sort_order' => 3,
            'is_free' => true,
            'is_published' => true,
        ]);
        TrainingResource::create([
            'training_lesson_id' => $lesson->id,
            'title' => 'Guide',
            'file_path' => 'training-resources/guide.pdf',
            'file_disk' => 'public',
            'file_type' => 'pdf',
            'sort_order' => 4,
        ]);
        $quiz = TrainingQuiz::create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'Validation',
            'passing_score' => 80,
            'is_published' => true,
        ]);
        TrainingQuizQuestion::create([
            'training_quiz_id' => $quiz->id,
            'question' => 'Bonne réponse ?',
            'options' => ['Oui', 'Non'],
            'correct_option_index' => 0,
            'sort_order' => 1,
            'points' => 2,
        ]);
        TrainingParticipant::create([
            'training_id' => $training->id,
            'name' => 'Participant Secret',
            'email' => 'secret@example.test',
            'phone' => '+41000000000',
            'status' => 'pending',
            'qty' => 1,
            'reference' => 'stripe-payment-secret',
        ]);

        $response = $this->actingAs($admin)->get(route('trainings.export-json', $training));

        $response->assertOk()
            ->assertHeader('content-type', 'application/json; charset=UTF-8')
            ->assertDownload('redeemer-training-formation-ethique.json');

        $json = $response->streamedContent();
        $package = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame('1.1', $package['schema_version']);
        $this->assertSame('training', $package['type']);
        $this->assertNotEmpty($package['exported_at']);
        $this->assertSame('Formation Éthique®', $package['data']['title']);
        $this->assertSame('trainings/image-éthique.jpg', $package['data']['featured_image']['original']);
        $this->assertSame('Module 1', $package['data']['sections'][0]['title']);
        $this->assertNotEmpty($package['data']['sections'][0]['stable_id']);
        $this->assertSame('Leçon 1', $package['data']['sections'][0]['lessons'][0]['title']);
        $this->assertSame('Guide', $package['data']['sections'][0]['lessons'][0]['resources'][0]['title']);
        $this->assertNotEmpty($package['data']['sections'][0]['lessons'][0]['resources'][0]['stable_id']);
        $this->assertSame('Validation', $package['data']['sections'][0]['quiz']['title']);
        $this->assertSame(['Oui', 'Non'], $package['data']['sections'][0]['quiz']['questions'][0]['options']);
        $this->assertNotEmpty($package['data']['sections'][0]['quiz']['questions'][0]['stable_id']);
        $this->assertStringNotContainsString('Participant Secret', $json);
        $this->assertStringNotContainsString('secret@example.test', $json);
        $this->assertStringNotContainsString('stripe-payment-secret', $json);
        $this->assertArrayNotHasKey('id', $package['data']);
        $this->assertArrayNotHasKey('user_id', $package['data']);
        $this->assertArrayNotHasKey('views', $package['data']);
    }

    public function test_non_admin_cannot_export_training(): void
    {
        $owner = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = Training::create([
            'user_id' => $owner->id,
            'title' => 'Formation privée',
            'slug' => 'formation-privee',
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
        ]);
        $user = User::factory()->create(['role' => 'client', 'is_active' => 1]);

        $this->actingAs($user)
            ->get(route('trainings.export-json', $training))
            ->assertForbidden();
    }

    public function test_http_download_with_unicode_and_html_can_be_uploaded_and_analyzed(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        $training = Training::create([
            'user_id' => $admin->id,
            'title' => 'Formation leadership & équipe « avancée »',
            'slug' => 'leadership-equipe-avancee',
            'excerpt' => "L’équipe apprend à s’adapter\navec méthode.",
            'content' => '<p>Contenu "complexe" — é è à ç 日本語</p>',
            'location' => 'Genève',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
        ]);
        $section = TrainingSection::create([
            'training_id' => $training->id,
            'title' => 'L’équipe & ses défis',
            'sort_order' => 1,
            'is_published' => true,
        ]);
        TrainingLesson::create([
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'title' => 'S’adapter « ensemble »',
            'slug' => 'adapter-ensemble',
            'content' => "<p>Première ligne</p>\n<p>Deuxième ligne & progrès</p>",
            'sort_order' => 1,
            'is_published' => true,
        ]);

        $download = $this->actingAs($admin)->get(route('trainings.export-json', $training));
        $download->assertOk()->assertDownload('redeemer-training-leadership-equipe-avancee.json');
        $json = $download->streamedContent();

        $this->assertStringStartsWith('{', $json);
        $this->assertFalse(str_starts_with($json, "\xEF\xBB\xBF"));
        $this->assertSame('Formation leadership & équipe « avancée »', json_decode($json, true, flags: JSON_THROW_ON_ERROR)['data']['title']);

        Log::spy();
        $analysisResponse = $this->actingAs($admin)->post(route('trainings.import-export.analyze'), [
            'file' => UploadedFile::fake()->createWithContent('download.json', $json),
        ]);

        Log::shouldHaveReceived('debug')->with(
            'Fichier reçu pour analyse d’un export de formation.',
            \Mockery::on(fn (array $context) => $context['content_length'] === strlen($json)
                && $context['sha256'] === hash('sha256', $json)
                && $context['first_bytes_hex'] === bin2hex(substr($json, 0, 8))
                && $context['json_error'] === 'No error')
        )->once();

        $analysisResponse->assertRedirect(route('trainings.import-export'));
        $this->followRedirects($analysisResponse)->assertInertia(fn ($page) => $page
            ->url('/dashboard/trainings/import-export')
            ->where('analysis.valid', true)
            ->where('analysis.status', 'existing')
            ->where('analysis.training.title', 'Formation leadership & équipe « avancée »'));
    }

    public function test_web_route_file_has_no_utf8_bom_that_can_pollute_streamed_downloads(): void
    {
        $bytes = file_get_contents(base_path('routes/web.php'));

        $this->assertIsString($bytes);
        $this->assertFalse(str_starts_with($bytes, "\xEF\xBB\xBF"));
    }
}
