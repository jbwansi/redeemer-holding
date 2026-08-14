<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminCreationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_seeder_never_creates_an_implicit_administrator(): void
    {
        foreach (['local', 'testing', 'staging', 'production'] as $environment) {
            $this->app->detectEnvironment(fn (): string => $environment);
            (new AdminSeeder())->run();
        }

        $this->app->detectEnvironment(fn (): string => 'testing');

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseMissing('users', ['email' => 'admin@admin.com']);
    }

    public function test_admin_seeder_contains_no_known_default_credentials(): void
    {
        $source = file_get_contents(database_path('seeders/AdminSeeder.php'));

        $this->assertIsString($source);
        $this->assertStringNotContainsString('admin@admin.com', $source);
        $this->assertStringNotContainsString("bcrypt('password')", $source);
    }

    public function test_database_seeder_does_not_recreate_an_implicit_administrator(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseMissing('users', ['role' => 'admin']);
        $this->assertDatabaseMissing('users', ['email' => 'admin@admin.com']);
    }

    public function test_command_creates_an_active_administrator_with_permissions(): void
    {
        $this->artisan('admin:create')
            ->expectsQuestion('Nom', 'Administratrice Redeemer')
            ->expectsQuestion('Adresse email', 'admin@example.test')
            ->expectsQuestion('Mot de passe', 'StrongPass-2026!')
            ->expectsQuestion('Confirmez le mot de passe', 'StrongPass-2026!')
            ->expectsConfirmation('Créer le compte administrateur admin@example.test ?', 'yes')
            ->expectsOutput('Compte administrateur créé avec succès.')
            ->assertSuccessful();

        $admin = User::query()->where('email', 'admin@example.test')->firstOrFail();

        $this->assertSame('admin', $admin->role);
        $this->assertTrue($admin->is_active);
        $this->assertTrue($admin->can('administer'));
        $this->assertTrue(Hash::check('StrongPass-2026!', $admin->password));
    }

    public function test_command_refuses_an_existing_email(): void
    {
        User::factory()->create(['email' => 'existing@example.test']);

        $this->artisan('admin:create')
            ->expectsQuestion('Nom', 'Administratrice Redeemer')
            ->expectsQuestion('Adresse email', 'existing@example.test')
            ->expectsQuestion('Mot de passe', 'StrongPass-2026!')
            ->expectsQuestion('Confirmez le mot de passe', 'StrongPass-2026!')
            ->assertFailed();

        $this->assertSame(1, User::query()->where('email', 'existing@example.test')->count());
    }

    public function test_command_applies_the_existing_password_rules(): void
    {
        $this->artisan('admin:create')
            ->expectsQuestion('Nom', 'Administratrice Redeemer')
            ->expectsQuestion('Adresse email', 'admin@example.test')
            ->expectsQuestion('Mot de passe', 'short')
            ->expectsQuestion('Confirmez le mot de passe', 'short')
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'admin@example.test']);
    }
}
