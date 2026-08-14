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
       Schema::create('training_lessons', function (Blueprint $table) {
    $table->id();

    $table->foreignId('training_id')
        ->constrained()
        ->cascadeOnDelete();

    // training_sections is created by the later 191631 migration. Keep the
    // column and its index here, then add the FK once its parent table exists.
    $table->foreignId('training_section_id')->index();

    $table->string('title');
    $table->string('slug')->unique();

    $table->text('excerpt')->nullable();
    $table->longText('content')->nullable();

    $table->string('video_url')->nullable();
    $table->integer('video_duration')->nullable();

    $table->json('thumbnail')->nullable();

    $table->integer('sort_order')->default(0);

    $table->boolean('is_free')->default(false);
    $table->boolean('is_published')->default(true);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_lessons');
    }
};
