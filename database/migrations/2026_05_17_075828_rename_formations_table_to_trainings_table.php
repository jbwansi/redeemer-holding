<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $legacyExists = Schema::hasTable('formations');
        $currentExists = Schema::hasTable('trainings');

        if ($legacyExists && $currentExists) {
            throw new RuntimeException(
                'Migration interrompue : les tables formations et trainings coexistent. '
                . 'Aucune table ne sera supprimée automatiquement.'
            );
        }

        if ($legacyExists) {
            Schema::rename('formations', 'trainings');

            return;
        }

        if (!$currentExists) {
            throw new RuntimeException(
                'Migration interrompue : ni formations ni trainings n’existe.'
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $legacyExists = Schema::hasTable('formations');
        $currentExists = Schema::hasTable('trainings');

        if ($legacyExists && $currentExists) {
            throw new RuntimeException(
                'Rollback interrompu : les tables formations et trainings coexistent.'
            );
        }

        if ($currentExists) {
            Schema::rename('trainings', 'formations');

            return;
        }

        if (!$legacyExists) {
            throw new RuntimeException(
                'Rollback interrompu : ni formations ni trainings n’existe.'
            );
        }
    }
};
