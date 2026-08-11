<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('career_goals', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title'); $table->text('current_situation')->nullable();
            $table->string('target_role')->nullable(); $table->string('target_sector')->nullable();
            $table->text('target_description')->nullable(); $table->string('language', 2);
            $table->string('status', 16)->default('draft'); $table->date('target_date')->nullable();
            $table->unsignedTinyInteger('progress')->default(0); $table->json('analysis')->nullable();
            $table->uuid('submission_token')->unique(); $table->timestamp('completed_at')->nullable();
            $table->timestamps(); $table->index(['user_id', 'status']);
        });
        Schema::create('career_actions', function (Blueprint $table) {
            $table->id(); $table->foreignId('career_goal_id')->constrained()->cascadeOnDelete();
            $table->string('title'); $table->text('description')->nullable();
            $table->string('priority', 12)->default('medium'); $table->string('status', 16)->default('todo');
            $table->date('due_date')->nullable(); $table->unsignedTinyInteger('progress')->default(0);
            $table->unsignedInteger('sort_order')->default(0); $table->string('source', 16)->default('manual');
            $table->timestamp('completed_at')->nullable(); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('career_actions'); Schema::dropIfExists('career_goals'); }
};
