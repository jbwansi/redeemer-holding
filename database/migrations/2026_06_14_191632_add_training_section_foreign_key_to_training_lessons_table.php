<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLE = 'training_lessons';

    private const COLUMN = 'training_section_id';

    private const FOREIGN_TABLE = 'training_sections';

    public function up(): void
    {
        $this->assertRequiredSchemaExists();

        $foreignKey = $this->foreignKeyForColumn();

        if ($foreignKey !== null) {
            if ($foreignKey['foreign_table'] !== self::FOREIGN_TABLE
                || $foreignKey['foreign_columns'] !== ['id']
                || strtolower($foreignKey['on_delete']) !== 'cascade') {
                throw new RuntimeException(
                    'Migration interrompue : training_lessons.training_section_id possède '
                    .'une contrainte étrangère incompatible.'
                );
            }

            return;
        }

        Schema::table(self::TABLE, function (Blueprint $table): void {
            $table->foreign(self::COLUMN, 'training_lessons_training_section_id_foreign')
                ->references('id')
                ->on(self::FOREIGN_TABLE)
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable(self::TABLE) || $this->foreignKeyForColumn() === null) {
            return;
        }

        Schema::table(self::TABLE, function (Blueprint $table): void {
            $table->dropForeign(['training_section_id']);
        });
    }

    private function assertRequiredSchemaExists(): void
    {
        if (!Schema::hasTable(self::TABLE)
            || !Schema::hasColumn(self::TABLE, self::COLUMN)
            || !Schema::hasTable(self::FOREIGN_TABLE)
            || !Schema::hasColumn(self::FOREIGN_TABLE, 'id')) {
            throw new RuntimeException(
                'Migration interrompue : le schéma requis pour la FK '
                .'training_lessons.training_section_id est incomplet.'
            );
        }
    }

    private function foreignKeyForColumn(): ?array
    {
        if (!Schema::hasTable(self::TABLE)) {
            return null;
        }

        foreach (Schema::getForeignKeys(self::TABLE) as $foreignKey) {
            if ($foreignKey['columns'] === [self::COLUMN]) {
                return $foreignKey;
            }
        }

        return null;
    }
};
