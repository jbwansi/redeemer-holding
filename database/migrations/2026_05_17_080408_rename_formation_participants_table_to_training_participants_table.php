<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $legacyExists = Schema::hasTable('formation_participants');
        $currentExists = Schema::hasTable('training_participants');

        if ($legacyExists && $currentExists) {
            throw new RuntimeException(
                'Migration interrompue : les tables formation_participants et '
                . 'training_participants coexistent. Aucune table ne sera supprimée automatiquement.'
            );
        }

        if ($legacyExists) {
            Schema::rename('formation_participants', 'training_participants');

            return;
        }

        if (!$currentExists) {
            throw new RuntimeException(
                'Migration interrompue : ni formation_participants ni '
                . 'training_participants n’existe.'
            );
        }
    }

    public function down(): void
    {
        $legacyExists = Schema::hasTable('formation_participants');
        $currentExists = Schema::hasTable('training_participants');

        if ($legacyExists && $currentExists) {
            throw new RuntimeException(
                'Rollback interrompu : les tables formation_participants et '
                . 'training_participants coexistent.'
            );
        }

        if ($currentExists) {
            Schema::rename('training_participants', 'formation_participants');

            return;
        }

        if (!$legacyExists) {
            throw new RuntimeException(
                'Rollback interrompu : ni formation_participants ni '
                . 'training_participants n’existe.'
            );
        }
    }
};
