<?php

namespace Tests\Feature;

use App\Models\Training;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\TestUsersSeeder;
use Database\Seeders\TrainingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SeederDeploymentSafetyTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        $this->setTestCredentials(null, null);
        $this->app->detectEnvironment(fn (): string => 'testing');
        parent::tearDown();
    }

    public function test_production_never_creates_test_users(): void
    {
        $this->app->detectEnvironment(fn (): string => 'production');
        $this->setTestCredentials('configured@example.test', 'Runtime-only-secret!');
        (new TestUsersSeeder())->run();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_staging_without_opt_in_creates_no_test_users(): void
    {
        $this->app->detectEnvironment(fn (): string => 'staging');
        $this->setTestCredentials(null, null);
        (new TestUsersSeeder())->run();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_local_is_opt_in_and_creates_only_configured_users(): void
    {
        $this->app->detectEnvironment(fn (): string => 'local');
        $this->setTestCredentials('local-one@example.test,local-two@example.test', 'Runtime-only-secret!');
        (new TestUsersSeeder())->run();
        $this->assertSame(
            ['local-one@example.test', 'local-two@example.test'],
            User::query()->orderBy('email')->pluck('email')->all()
        );
    }

    public function test_staging_opt_in_creates_only_explicitly_allowed_users(): void
    {
        $this->app->detectEnvironment(fn (): string => 'staging');
        $this->setTestCredentials('allowed@example.test', 'Runtime-only-secret!');
        (new TestUsersSeeder())->run();

        $user = User::query()->sole();
        $this->assertSame('allowed@example.test', $user->email);
        $this->assertSame('client', $user->role);
        $this->assertTrue(Hash::check('Runtime-only-secret!', $user->password));
    }

    public function test_testing_uses_factories_instead_of_test_user_seeder(): void
    {
        $this->setTestCredentials('configured@example.test', 'Runtime-only-secret!');
        (new TestUsersSeeder())->run();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_database_seeder_is_safe_by_default_in_production(): void
    {
        $this->app->detectEnvironment(fn (): string => 'production');
        $this->setTestCredentials(null, null);
        (new DatabaseSeeder())->run();
        $this->assertDatabaseMissing('users', ['role' => 'admin']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_database_seeder_does_not_add_demo_content_to_an_existing_production_database(): void
    {
        $this->app->detectEnvironment(fn (): string => 'production');
        User::factory()->create(['role' => 'admin']);

        (new DatabaseSeeder())->run();

        $this->assertDatabaseCount('trainings', 0);
        $this->assertDatabaseCount('training_participants', 0);
    }

    public function test_training_seeder_preserves_administered_content_and_participants(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $training = Training::query()->create([
            'slug' => 'programme-transformation-90-jours',
            'title' => 'Contenu administré',
            'excerpt' => 'Contenu éditorial à préserver.',
            'content' => '<p>Contenu administré</p>',
            'location' => 'Lieu administré',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'price' => 100,
            'is_published' => true,
            'user_id' => $admin->id,
        ]);
        $training->participants()->create([
            'name' => 'Participant conservé', 'email' => 'alice.dupont@example.com',
            'status' => 'pending', 'reference' => 'ADMIN-SENTINEL', 'qty' => 1,
        ]);

        (new TrainingSeeder())->run();

        $this->assertSame('Contenu administré', $training->fresh()->title);
        $this->assertDatabaseHas('training_participants', [
            'training_id' => $training->id, 'reference' => 'ADMIN-SENTINEL',
        ]);
    }

    public function test_training_seeder_creates_missing_demo_trainings_on_fresh_content_state(): void
    {
        User::factory()->create(['role' => 'admin']);
        (new TrainingSeeder())->run();
        $this->assertDatabaseHas('trainings', ['slug' => 'programme-transformation-90-jours']);
        $this->assertSame(5, Training::query()->count());
    }

    public function test_test_user_seeder_has_no_known_credentials_or_demo_email_fallback(): void
    {
        $source = file_get_contents(database_path('seeders/TestUsersSeeder.php'));
        $importSource = file_get_contents(app_path('Http/Controllers/Admin/UserController.php'));
        $this->assertStringNotContainsString('Test1234!', $source);
        $this->assertStringNotContainsString('testeur1@example.com', $source);
        $this->assertStringNotContainsString('testeur2@example.com', $source);
        $this->assertStringNotContainsString('Test1234!', $importSource);
    }

    private function setTestCredentials(?string $emails, ?string $password): void
    {
        foreach (['TEST_ALLOWED_EMAILS' => $emails, 'TEST_USERS_PASSWORD' => $password] as $key => $value) {
            if ($value === null) {
                unset($_ENV[$key], $_SERVER[$key]);
                putenv($key);
            } else {
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
    }
}
