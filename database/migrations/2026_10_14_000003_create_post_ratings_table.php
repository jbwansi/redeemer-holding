<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('blog_actor_id')->constrained()->restrictOnDelete();
            // Finite SQL domain on both SQLite (CHECK) and MySQL (ENUM).
            $table->enum('rating', ['1', '2', '3', '4', '5']);
            $table->timestamps();
            $table->unique(['post_id', 'blog_actor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_ratings');
    }
};
