<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('coach_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cv_document_id')->constrained('user_documents')->restrictOnDelete();
            $table->foreignId('job_document_id')->nullable()->constrained('user_documents')->restrictOnDelete();
            $table->string('job_title');
            $table->string('company_name')->nullable();
            $table->string('language', 2);
            $table->string('status', 16)->default('pending');
            $table->string('analysis_type', 32)->default('cv_job_match');
            $table->json('result')->nullable();
            $table->string('prompt_key');
            $table->string('prompt_version', 16);
            $table->uuid('submission_token')->unique();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coach_analyses');
    }
};
