<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {

            $table->string('payment_id')
                ->nullable()
                ->after('status');

            $table->string('stripe_session_id')
                ->nullable()
                ->after('payment_id');

            $table->decimal('payment_amount', 10, 2)
                ->nullable()
                ->after('stripe_session_id');

            $table->timestamp('payment_date')
                ->nullable()
                ->after('payment_amount');

            $table->boolean('payment_confirmed')
                ->default(false)
                ->after('payment_date');

            $table->text('payment_error')
                ->nullable()
                ->after('payment_confirmed');
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {

            $table->dropColumn([
                'payment_id',
                'stripe_session_id',
                'payment_amount',
                'payment_date',
                'payment_confirmed',
                'payment_error',
            ]);
        });
    }
};