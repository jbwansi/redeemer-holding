<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('training_progress', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('training_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('training_lesson_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('completed')->default(false);

            $table->timestamp('completed_at')->nullable();

            $table->integer('watch_time')->default(0);

            $table->timestamps();

            $table->unique([
                'user_id',
                'training_lesson_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_progress');
    }
};
