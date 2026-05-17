<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_participants', function (Blueprint $table) {
            $table->dropForeign('formation_participants_formation_id_foreign');
        });

        Schema::table('training_participants', function (Blueprint $table) {
            $table->renameColumn('formation_id', 'training_id');
        });

        Schema::table('training_participants', function (Blueprint $table) {
            $table->foreign('training_id')
                  ->references('id')
                  ->on('trainings')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('training_participants', function (Blueprint $table) {
            $table->dropForeign(['training_id']);
        });

        Schema::table('training_participants', function (Blueprint $table) {
            $table->renameColumn('training_id', 'formation_id');
        });

        Schema::table('training_participants', function (Blueprint $table) {
            $table->foreign('formation_id')
                  ->references('id')
                  ->on('formations');
        });
    }
};