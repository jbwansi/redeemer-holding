<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('professional_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('professional_title')->nullable();
            $table->text('summary')->nullable();
            $table->text('career_objective')->nullable();
            $table->string('default_language', 2)->default('fr');
            $table->json('target_roles')->nullable();
            $table->json('target_sectors')->nullable();
            $table->json('languages')->nullable();
            $table->timestamps();
        });

        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('original_name');
            $table->string('path');
            $table->string('disk', 32)->default('coach_private');
            $table->string('mime_type', 128);
            $table->unsignedBigInteger('size');
            $table->string('language', 2)->nullable();
            $table->char('sha256', 64);
            $table->string('status', 16)->default('uploaded');
            $table->timestamps();
            $table->index(['user_id', 'type']);
        });

        Schema::create('coach_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('module', 32)->default('general');
            $table->string('title');
            $table->string('language', 2)->default('fr');
            $table->string('status', 16)->default('active');
            $table->json('context')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('coach_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_conversation_id')->constrained()->cascadeOnDelete();
            $table->string('role', 24);
            $table->text('content');
            $table->json('structured_data')->nullable();
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->timestamps();
        });

        Schema::create('coach_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('module', 32);
            $table->string('operation', 64);
            $table->string('provider', 32);
            $table->string('model')->nullable();
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedBigInteger('estimated_cost_micros')->default(0);
            $table->unsignedInteger('duration_ms')->default(0);
            $table->string('status', 16);
            $table->uuid('correlation_id');
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coach_usages');
        Schema::dropIfExists('coach_messages');
        Schema::dropIfExists('coach_conversations');
        Schema::dropIfExists('user_documents');
        Schema::dropIfExists('professional_profiles');
    }
};
