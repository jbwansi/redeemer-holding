<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('interview_simulations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('job_title');
            $table->string('company_name')->nullable();
            $table->text('job_description')->nullable();
            $table->string('interview_type', 32);
            $table->string('difficulty', 16);
            $table->string('language', 2);
            $table->string('status', 16)->default('draft');
            $table->unsignedInteger('current_turn')->default(0);
            $table->unsignedTinyInteger('score')->nullable();
            $table->text('summary')->nullable();
            $table->json('analysis')->nullable();
            $table->json('strengths')->nullable();
            $table->json('improvements')->nullable();
            $table->json('recommended_actions')->nullable();
            $table->json('questions_to_rehearse')->nullable();
            $table->json('candidate_questions')->nullable();
            $table->json('document_ids')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('interview_turns', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('interview_simulation_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->string('category', 32);
            $table->text('question');
            $table->text('answer')->nullable();
            $table->text('feedback')->nullable();
            $table->unsignedTinyInteger('score')->nullable();
            $table->json('metadata')->nullable();
            $table->uuid('submission_token')->nullable()->unique();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
            $table->unique(['interview_simulation_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_turns');
        Schema::dropIfExists('interview_simulations');
    }
};
