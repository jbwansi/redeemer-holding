<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class TrainingSectionForeignKeyMigrationTest extends TestCase
{
    private string $originalConnection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->originalConnection = (string) config('database.default');
        config([
            'database.default' => 'lms_migration_safety',
            'database.connections.lms_migration_safety' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
        ]);

        DB::purge('lms_migration_safety');
        DB::connection('lms_migration_safety')->getPdo();
    }

    protected function tearDown(): void
    {
        DB::purge('lms_migration_safety');
        config(['database.default' => $this->originalConnection]);

        parent::tearDown();
    }

    public function test_historical_lesson_migration_runs_before_sections_exist(): void
    {
        $this->createTrainingsTable();

        $this->lessonMigration()->up();

        $this->assertTrue(Schema::hasColumn('training_lessons', 'training_section_id'));
        $this->assertNull($this->sectionForeignKey());
    }

    public function test_corrective_migration_adds_the_expected_foreign_key_idempotently(): void
    {
        $this->createTrainingsTable();
        $this->lessonMigration()->up();
        $this->sectionMigration()->up();

        $migration = $this->correctiveMigration();
        $migration->up();
        $migration->up();

        $foreignKeys = collect(Schema::getForeignKeys('training_lessons'))
            ->where('columns', ['training_section_id'])
            ->values();

        $this->assertCount(1, $foreignKeys);
        $this->assertSame('training_sections', $foreignKeys[0]['foreign_table']);
        $this->assertSame(['id'], $foreignKeys[0]['foreign_columns']);
        $this->assertSame('cascade', strtolower($foreignKeys[0]['on_delete']));
    }

    public function test_corrective_migration_preserves_existing_lms_data(): void
    {
        $this->createTrainingsTable();
        $this->lessonMigration()->up();
        $this->sectionMigration()->up();
        $this->createUsersAndProgressTables();

        DB::table('trainings')->insert(['id' => 10, 'title' => 'TRAINING_SENTINEL']);
        DB::table('training_sections')->insert([
            'id' => 20, 'training_id' => 10, 'title' => 'SECTION_SENTINEL',
        ]);
        DB::table('training_lessons')->insert([
            'id' => 30,
            'training_id' => 10,
            'training_section_id' => 20,
            'title' => 'LESSON_SENTINEL',
            'slug' => 'lesson-sentinel',
        ]);
        DB::table('users')->insert(['id' => 40, 'name' => 'USER_SENTINEL']);
        DB::table('training_progress')->insert([
            'id' => 50,
            'user_id' => 40,
            'training_id' => 10,
            'training_lesson_id' => 30,
            'completed' => true,
        ]);

        $this->correctiveMigration()->up();

        $this->assertSame('SECTION_SENTINEL', DB::table('training_sections')->value('title'));
        $this->assertSame('LESSON_SENTINEL', DB::table('training_lessons')->value('title'));
        $this->assertSame(1, DB::table('training_progress')->where('id', 50)->count());
    }

    public function test_already_migrated_sqlite_schema_is_left_unchanged(): void
    {
        $this->createTrainingsTable();
        $this->sectionMigration()->up();
        Schema::create('training_lessons', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('training_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_section_id')->constrained()->cascadeOnDelete();
            $table->string('title');
        });
        DB::table('trainings')->insert(['id' => 1, 'title' => 'TRAINING_SENTINEL']);
        DB::table('training_sections')->insert(['id' => 2, 'training_id' => 1, 'title' => 'SECTION_SENTINEL']);
        DB::table('training_lessons')->insert([
            'id' => 3, 'training_id' => 1, 'training_section_id' => 2, 'title' => 'LESSON_SENTINEL',
        ]);

        $before = Schema::getForeignKeys('training_lessons');
        $this->correctiveMigration()->up();

        $this->assertSame($before, Schema::getForeignKeys('training_lessons'));
        $this->assertSame('LESSON_SENTINEL', DB::table('training_lessons')->value('title'));
    }

    private function createTrainingsTable(): void
    {
        Schema::create('trainings', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
        });
    }

    private function createUsersAndProgressTables(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
        });
        Schema::create('training_progress', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id');
            $table->foreignId('training_id');
            $table->foreignId('training_lesson_id');
            $table->boolean('completed')->default(false);
        });
    }

    private function lessonMigration(): object
    {
        return require database_path('migrations/2026_06_14_182445_create_training_lessons_table.php');
    }

    private function sectionMigration(): object
    {
        return require database_path('migrations/2026_06_14_191631_create_training_sections_table.php');
    }

    private function correctiveMigration(): object
    {
        return require database_path(
            'migrations/2026_06_14_191632_add_training_section_foreign_key_to_training_lessons_table.php'
        );
    }

    private function sectionForeignKey(): ?array
    {
        return collect(Schema::getForeignKeys('training_lessons'))
            ->first(fn (array $foreignKey): bool => $foreignKey['columns'] === ['training_section_id']);
    }
}
