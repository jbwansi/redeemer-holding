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
        Schema::create('training_participants', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->foreignId('training_id')->constrained()->nullable();
            $table->string('name')->nullable();
            $table->integer('qty')->default(1);
            $table->string('email');
            $table->string('phone')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->string('reference')->nullable();


            $table->string('stripe_session_id')->nullable();
            $table->string('payment_id')->nullable();
            $table->decimal('payment_amount', 10, 2)->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->boolean('payment_confirmed')->default(false);
            $table->string('payment_error')->nullable();


            $table->string('refund_id')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamp('refund_date')->nullable();


            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();


            $table->index('stripe_session_id');
            $table->index('payment_id');
            $table->index('reference');
            $table->index(['training_id', 'status']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_participants');
    }
};
