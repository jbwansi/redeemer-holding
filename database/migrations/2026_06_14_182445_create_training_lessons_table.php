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

    $table->foreignId('training_section_id')
        ->constrained()
        ->cascadeOnDelete();

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
