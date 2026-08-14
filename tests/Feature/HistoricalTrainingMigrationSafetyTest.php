<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Tests\TestCase;

class HistoricalTrainingMigrationSafetyTest extends TestCase
{
    private string $originalConnection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->originalConnection = (string) config('database.default');
        config([
            'database.default' => 'migration_safety',
            'database.connections.migration_safety' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
        ]);

        DB::purge('migration_safety');
        DB::connection('migration_safety')->getPdo();
    }

    protected function tearDown(): void
    {
        DB::purge('migration_safety');
        config(['database.default' => $this->originalConnection]);

        parent::tearDown();
    }

    public function test_formations_old_only_is_renamed_with_its_data(): void
    {
        $this->createTrainingTable('formations');
        DB::table('formations')->insert(['id' => 1, 'title' => 'OLD_SENTINEL']);

        $this->trainingRenameMigration()->up();

        $this->assertFalse(Schema::hasTable('formations'));
        $this->assertSame(['OLD_SENTINEL'], DB::table('trainings')->pluck('title')->all());
    }

    public function test_formations_new_only_is_preserved_unchanged(): void
    {
        $this->createTrainingTable('trainings');
        DB::table('trainings')->insert(['id' => 2, 'title' => 'NEW_SENTINEL']);

        $this->trainingRenameMigration()->up();

        $this->assertFalse(Schema::hasTable('formations'));
        $this->assertSame(['NEW_SENTINEL'], DB::table('trainings')->pluck('title')->all());
    }

    public function test_formations_coexistence_is_refused_without_data_loss(): void
    {
        $this->createTrainingTable('formations');
        $this->createTrainingTable('trainings');
        DB::table('formations')->insert(['id' => 1, 'title' => 'OLD_SENTINEL']);
        DB::table('trainings')->insert(['id' => 2, 'title' => 'NEW_SENTINEL']);

        try {
            $this->trainingRenameMigration()->up();
            $this->fail('La coexistence aurait dû interrompre la migration.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('coexistent', $exception->getMessage());
        }

        $this->assertSame(['OLD_SENTINEL'], DB::table('formations')->pluck('title')->all());
        $this->assertSame(['NEW_SENTINEL'], DB::table('trainings')->pluck('title')->all());
    }

    public function test_formations_missing_pair_is_refused_explicitly(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('ni formations ni trainings');

        $this->trainingRenameMigration()->up();
    }

    public function test_participants_old_only_is_renamed_with_payment_data(): void
    {
        $this->createParticipantTable('formation_participants');
        DB::table('formation_participants')->insert([
            'id' => 1,
            'email' => 'old-sentinel@example.test',
            'payment_id' => 'PAYMENT_OLD',
        ]);

        $this->participantRenameMigration()->up();

        $this->assertFalse(Schema::hasTable('formation_participants'));
        $this->assertSame(
            [['email' => 'old-sentinel@example.test', 'payment_id' => 'PAYMENT_OLD']],
            DB::table('training_participants')->get(['email', 'payment_id'])
                ->map(fn ($row): array => (array) $row)->all()
        );
    }

    public function test_participants_new_only_is_preserved_unchanged(): void
    {
        $this->createParticipantTable('training_participants');
        DB::table('training_participants')->insert([
            'id' => 2,
            'email' => 'new-sentinel@example.test',
            'payment_id' => 'PAYMENT_NEW',
        ]);

        $this->participantRenameMigration()->up();

        $this->assertFalse(Schema::hasTable('formation_participants'));
        $this->assertSame(
            ['new-sentinel@example.test'],
            DB::table('training_participants')->pluck('email')->all()
        );
    }

    public function test_participants_coexistence_is_refused_without_payment_data_loss(): void
    {
        $this->createParticipantTable('formation_participants');
        $this->createParticipantTable('training_participants');
        DB::table('formation_participants')->insert([
            'id' => 1,
            'email' => 'old-sentinel@example.test',
            'payment_id' => 'PAYMENT_OLD',
        ]);
        DB::table('training_participants')->insert([
            'id' => 2,
            'email' => 'new-sentinel@example.test',
            'payment_id' => 'PAYMENT_NEW',
        ]);

        try {
            $this->participantRenameMigration()->up();
            $this->fail('La coexistence aurait dû interrompre la migration.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('coexistent', $exception->getMessage());
        }

        $this->assertSame(
            ['PAYMENT_OLD'],
            DB::table('formation_participants')->pluck('payment_id')->all()
        );
        $this->assertSame(
            ['PAYMENT_NEW'],
            DB::table('training_participants')->pluck('payment_id')->all()
        );
    }

    public function test_participants_missing_pair_is_refused_explicitly(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('ni formation_participants ni training_participants');

        $this->participantRenameMigration()->up();
    }

    public function test_preflight_accepts_consistent_legacy_state(): void
    {
        $this->createTrainingTable('formations');
        $this->createParticipantTable('formation_participants');

        $this->artisan('deployment:preflight')
            ->expectsOutputToContain('Preflight migrations réussi')
            ->assertSuccessful();
    }

    public function test_preflight_accepts_a_genuinely_fresh_database(): void
    {
        $this->artisan('deployment:preflight')
            ->expectsOutputToContain('Fresh database')
            ->assertSuccessful();
    }

    public function test_preflight_accepts_consistent_modern_state(): void
    {
        $this->createTrainingTable('trainings');
        $this->createParticipantTable('training_participants');

        $this->artisan('deployment:preflight')
            ->expectsOutputToContain('Preflight migrations réussi')
            ->assertSuccessful();
    }

    public function test_preflight_refuses_mixed_generations_without_changing_data(): void
    {
        $this->createTrainingTable('formations');
        $this->createParticipantTable('training_participants');
        DB::table('formations')->insert(['id' => 1, 'title' => 'OLD_SENTINEL']);
        DB::table('training_participants')->insert([
            'id' => 2, 'email' => 'new-sentinel@example.test', 'payment_id' => 'PAYMENT_NEW',
        ]);

        $this->artisan('deployment:preflight')
            ->expectsOutputToContain('État incohérent')
            ->assertFailed();

        $this->assertSame(['OLD_SENTINEL'], DB::table('formations')->pluck('title')->all());
        $this->assertSame(['PAYMENT_NEW'], DB::table('training_participants')->pluck('payment_id')->all());
    }

    public function test_preflight_refuses_recorded_migrations_with_missing_tables(): void
    {
        Schema::create('migrations', function (Blueprint $table): void {
            $table->id();
            $table->string('migration');
            $table->integer('batch');
        });
        DB::table('migrations')->insert([
            'migration' => '2026_05_17_075828_rename_formations_table_to_trainings_table',
            'batch' => 1,
        ]);

        $this->artisan('deployment:preflight')
            ->expectsOutputToContain('État incomplet')
            ->assertFailed();

        $this->assertDatabaseHas('migrations', [
            'migration' => '2026_05_17_075828_rename_formations_table_to_trainings_table',
        ]);
    }

    public function test_preflight_refuses_coexistence_without_changing_sentinels(): void
    {
        $this->createTrainingTable('formations');
        $this->createTrainingTable('trainings');
        $this->createParticipantTable('formation_participants');
        DB::table('formations')->insert(['id' => 1, 'title' => 'OLD_SENTINEL']);
        DB::table('trainings')->insert(['id' => 2, 'title' => 'NEW_SENTINEL']);

        $this->artisan('deployment:preflight')
            ->expectsOutputToContain('État ambigu')
            ->assertFailed();

        $this->assertSame(['OLD_SENTINEL'], DB::table('formations')->pluck('title')->all());
        $this->assertSame(['NEW_SENTINEL'], DB::table('trainings')->pluck('title')->all());
    }

    private function createTrainingTable(string $name): void
    {
        Schema::create($name, function (Blueprint $table): void {
            $table->id();
            $table->string('title');
        });
    }

    private function createParticipantTable(string $name): void
    {
        Schema::create($name, function (Blueprint $table): void {
            $table->id();
            $table->string('email');
            $table->string('payment_id')->nullable();
        });
    }

    private function trainingRenameMigration(): object
    {
        return require database_path(
            'migrations/2026_05_17_075828_rename_formations_table_to_trainings_table.php'
        );
    }

    private function participantRenameMigration(): object
    {
        return require database_path(
            'migrations/2026_05_17_080408_rename_formation_participants_table_to_training_participants_table.php'
        );
    }
}
