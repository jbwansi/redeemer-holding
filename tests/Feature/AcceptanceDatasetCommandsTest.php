<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\A383DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class AcceptanceDatasetCommandsTest extends TestCase
{
    use RefreshDatabase;

    private function stagingDependencies(bool $careerEnabled = true, string $environment = 'staging'): void
    {
        app()->detectEnvironment(static fn (): string => $environment);
        config([
            'acceptance.dataset_id' => 'A383-v1',
            'acceptance.password' => 'acceptance-secret-from-config',
            'acceptance.accounts' => [
                'admin' => ['name' => 'TEST A383 Admin', 'email' => 'a383-admin@example.test'],
                'client' => ['name' => 'TEST A383 Client', 'email' => 'a383-client@example.test'],
                'forbidden' => ['name' => 'TEST A383 Client Forbidden', 'email' => 'a383-forbidden@example.test'],
            ],
            'mail.default' => 'array',
            'mail.staging.allowed_recipients' => ['a383-client@example.test'],
        ]);
        User::factory()->create(['role' => 'admin', 'is_active' => 1]);
        User::factory()->create(['role' => 'client', 'is_active' => 1]);
        DB::table('event_categories')->insert(['name' => 'Existing', 'slug' => 'existing-category', 'color' => '#000000', 'created_at' => now(), 'updated_at' => now()]);
        if ($careerEnabled) {
            DB::table('settings')->insert(['type' => 'coach_module_career', 'value' => '1', 'created_at' => now(), 'updated_at' => now()]);
        }
        Cache::forget('coach_settings');
        Storage::fake('local');
        Storage::fake('coach_private');
        Storage::fake('public');
    }

    public function test_local_environment_is_explicitly_allowed(): void
    {
        $this->stagingDependencies(true, 'local');
        $this->artisan('acceptance:provision --dry-run')->assertSuccessful();
        $this->assertDatabaseCount('trainings', 0);
    }

    public function test_staging_environment_is_explicitly_allowed(): void
    {
        $this->stagingDependencies(true, 'staging');
        $this->artisan('acceptance:provision --dry-run')->assertSuccessful();
        $this->assertDatabaseCount('trainings', 0);
    }

    public function test_production_environment_is_absolutely_refused(): void
    {
        app()->detectEnvironment(static fn (): string => 'production');
        $this->artisan('acceptance:provision --dry-run')->assertFailed();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_unlisted_environment_is_refused(): void
    {
        app()->detectEnvironment(static fn (): string => 'qa');
        $this->artisan('acceptance:provision --dry-run')->assertFailed();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_local_environment_refuses_any_non_array_mailer(): void
    {
        $this->stagingDependencies(true, 'local');
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.transport' => 'smtp']);
        $this->artisan('acceptance:provision --dry-run')->assertFailed();
        $this->assertDatabaseCount('trainings', 0);
        $this->assertDatabaseCount('users', 2);
    }

    public function test_dry_run_does_not_mutate_any_business_table(): void
    {
        $this->stagingDependencies();
        $before = DB::table('users')->count();
        $this->artisan('acceptance:provision --dry-run')->assertSuccessful();
        $this->assertSame($before, DB::table('users')->count());
        $this->assertDatabaseCount('trainings', 0);
        $this->assertDatabaseCount('events', 0);
        Storage::disk('local')->assertDirectoryEmpty('/');
    }

    public function test_apply_creates_exact_manifest_without_mail_job_or_stripe_side_effect(): void
    {
        $this->stagingDependencies();
        Mail::fake();
        Queue::fake();
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $this->assertDatabaseCount('users', 5);
        $this->assertDatabaseHas('event_categories', ['slug' => 'test-a383-category']);
        $this->assertDatabaseHas('users', ['name' => 'TEST A383 Admin', 'email' => 'a383-admin@example.test', 'role' => 'admin', 'is_active' => 1]);
        $this->assertDatabaseHas('users', ['name' => 'TEST A383 Client', 'email' => 'a383-client@example.test', 'role' => 'client', 'is_active' => 1]);
        $this->assertDatabaseHas('users', ['name' => 'TEST A383 Client Forbidden', 'email' => 'a383-forbidden@example.test', 'role' => 'client', 'is_active' => 1]);
        $this->assertDatabaseCount('trainings', 2);
        $this->assertDatabaseCount('training_sections', 2);
        $this->assertDatabaseCount('training_lessons', 3);
        $this->assertDatabaseCount('training_quiz_questions', 2);
        $this->assertDatabaseCount('events', 2);
        $this->assertDatabaseCount('services', 1);
        $this->assertDatabaseCount('coach_messages', 2);
        $this->assertDatabaseCount('training_participants', 0);
        $this->assertDatabaseCount('training_progress', 0);
        $this->assertDatabaseCount('training_quiz_attempts', 0);
        $this->assertDatabaseCount('service_requests', 0);
        $this->assertDatabaseCount('event_participants', 0);
        Mail::assertNothingSent();
        Queue::assertNothingPushed();
        $manifest = collect(Storage::disk('local')->allFiles('acceptance'))->first();
        $this->assertNotNull($manifest);
        $decoded = json_decode(Storage::disk('local')->get($manifest), true);
        $this->assertSame(2, count($decoded['rows']['trainings']));
        $this->assertCount(2, $decoded['files']);
        foreach ($decoded['files'] as $file) {
            Storage::disk($file['disk'])->assertExists($file['path']);
        }
    }

    public function test_second_apply_is_an_idempotent_no_op(): void
    {
        $this->stagingDependencies();
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $ids = DB::table('trainings')->orderBy('id')->pluck('id')->all();
        $users = DB::table('users')->where('name', 'like', 'TEST A383%')->orderBy('id')->pluck('id')->all();
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $this->assertSame($ids, DB::table('trainings')->orderBy('id')->pluck('id')->all());
        $this->assertSame($users, DB::table('users')->where('name', 'like', 'TEST A383%')->orderBy('id')->pluck('id')->all());
        $this->assertCount(1, Storage::disk('local')->allFiles('acceptance'));
    }

    public function test_cleanup_dry_run_uses_exact_manifest_and_deletes_nothing(): void
    {
        $this->stagingDependencies();
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $file = collect(Storage::disk('local')->allFiles('acceptance'))->first();
        $runId = basename($file, '.json');
        $this->artisan("acceptance:cleanup {$runId} --dry-run")->assertSuccessful();
        $this->assertDatabaseCount('trainings', 2);
        Storage::disk('local')->assertExists($file);
    }

    public function test_apply_never_changes_historical_content(): void
    {
        $this->stagingDependencies();
        $id = DB::table('services')->insertGetId(['user_id' => 1, 'name' => 'Historical', 'slug' => 'historical-service', 'content' => 'Administered', 'views' => 7, 'status' => 1, 'created_at' => now(), 'updated_at' => now()]);
        $before = (array) DB::table('services')->find($id);
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $this->assertSame($before, (array) DB::table('services')->find($id));
    }

    public function test_disabled_career_module_omits_goal_and_action_without_changing_settings(): void
    {
        $this->stagingDependencies(false);
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $this->assertDatabaseCount('career_goals', 0);
        $this->assertDatabaseCount('career_actions', 0);
        $this->assertDatabaseMissing('settings', ['type' => 'coach_module_career']);
    }

    public function test_local_database_seeder_automatically_creates_a383(): void
    {
        app()->detectEnvironment(static fn (): string => 'local');
        config(['mail.default' => 'array', 'mail.mailers.array.transport' => 'array']);
        Storage::fake('local');
        Storage::fake('coach_private');
        Storage::fake('public');
        $this->seed();
        $this->assertDatabaseHas('users', ['email' => A383DemoSeeder::LOCAL_ADMIN_EMAIL, 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => A383DemoSeeder::LOCAL_CLIENT_EMAIL, 'role' => 'client']);
        $this->assertDatabaseHas('trainings', ['slug' => 'TEST-A383-FREE']);
    }

    public function test_local_demo_seeder_is_idempotent(): void
    {
        app()->detectEnvironment(static fn (): string => 'local');
        config(['mail.default' => 'log', 'mail.mailers.log.transport' => 'log']);
        Storage::fake('local');
        Storage::fake('coach_private');
        Storage::fake('public');
        $this->seed(A383DemoSeeder::class);
        $ids = DB::table('users')->where('name', 'like', 'TEST A383%')->orderBy('id')->pluck('id')->all();
        $this->seed(A383DemoSeeder::class);
        $this->assertSame($ids, DB::table('users')->where('name', 'like', 'TEST A383%')->orderBy('id')->pluck('id')->all());
        $this->assertDatabaseCount('trainings', 2);
    }

    public function test_staging_explicit_demo_seed_is_allowed_with_valid_configuration(): void
    {
        $this->stagingDependencies(false);
        $this->seed(A383DemoSeeder::class);
        $this->assertDatabaseHas('users', ['email' => 'a383-admin@example.test', 'role' => 'admin']);
        $this->assertDatabaseHas('trainings', ['slug' => 'TEST-A383-PAID']);
    }

    public function test_staging_database_seeder_does_not_automatically_create_a383(): void
    {
        app()->detectEnvironment(static fn (): string => 'staging');
        $this->seed();
        $this->assertDatabaseMissing('trainings', ['slug' => 'TEST-A383-FREE']);
        $this->assertDatabaseMissing('users', ['name' => 'TEST A383 Client']);
    }

    public function test_demo_seeder_is_explicitly_refused_in_production(): void
    {
        app()->detectEnvironment(static fn (): string => 'production');
        $this->expectException(RuntimeException::class);
        (new A383DemoSeeder)->run();
    }

    public function test_production_cli_seed_command_is_refused_even_with_force(): void
    {
        app()->detectEnvironment(static fn (): string => 'production');
        $this->expectException(RuntimeException::class);
        $this->artisan('db:seed --class=A383DemoSeeder --force');
    }

    public function test_cleanup_apply_removes_only_manifested_rows_and_files(): void
    {
        $this->stagingDependencies(false);
        $historical = DB::table('users')->orderBy('id')->pluck('id')->all();
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $this->artisan('acceptance:cleanup A383-v1 --apply')->assertSuccessful();
        $this->assertSame($historical, DB::table('users')->orderBy('id')->pluck('id')->all());
        $this->assertDatabaseCount('trainings', 0);
        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('services', 0);
        Storage::disk('local')->assertMissing('acceptance/A383-v1.json');
    }

    public function test_cleanup_refuses_unmanifested_workflow_dependencies(): void
    {
        $this->stagingDependencies(false);
        $this->artisan('acceptance:provision --apply')->assertSuccessful();
        $training = DB::table('trainings')->where('slug', 'TEST-A383-FREE')->first();
        $client = DB::table('users')->where('email', 'a383-client@example.test')->first();
        DB::table('training_participants')->insert([
            'training_id' => $training->id, 'user_id' => $client->id, 'email' => $client->email, 'status' => 'pending',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->artisan('acceptance:cleanup A383-v1 --apply')->assertFailed();
        $this->assertDatabaseHas('trainings', ['id' => $training->id]);
        $this->assertDatabaseHas('users', ['id' => $client->id]);
    }
}
