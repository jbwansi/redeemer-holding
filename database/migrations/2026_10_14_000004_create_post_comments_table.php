<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('blog_actor_id')->constrained()->restrictOnDelete();
            $table->string('display_name', 80);
            $table->text('body');
            $table->enum('status', ['pending', 'approved', 'rejected', 'spam'])->default('pending');
            $table->uuid('submission_key');
            $table->char('content_hash', 64);
            $table->timestamps();
            $table->unique(['blog_actor_id', 'submission_key'], 'post_comments_actor_submission_unique');
            $table->index(['post_id', 'status', 'created_at', 'id'], 'post_comments_public_index');
            $table->index(['status', 'created_at']);
            $table->index(['blog_actor_id', 'content_hash', 'created_at'], 'post_comments_duplicate_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_comments');
    }
};
