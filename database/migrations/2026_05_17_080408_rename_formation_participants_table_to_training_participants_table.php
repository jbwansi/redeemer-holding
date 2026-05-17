<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        if (Schema::hasTable('training_participants')) {
            Schema::drop('training_participants');
        }

        if (Schema::hasTable('formation_participants')) {
            Schema::rename(
                'formation_participants',
                'training_participants'
            );
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        if (Schema::hasTable('training_participants')) {
            Schema::rename(
                'training_participants',
                'formation_participants'
            );
        }

        Schema::enableForeignKeyConstraints();
    }
};