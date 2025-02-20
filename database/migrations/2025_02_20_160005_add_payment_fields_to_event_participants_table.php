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
        Schema::table('event_participants', function (Blueprint $table) {
            // Ajout des champs pour la gestion des références
            $table->string('reference')->nullable()->after('phone');

            // Ajout des champs pour Stripe
            $table->string('stripe_session_id')->nullable()->after('status');
            $table->string('payment_id')->nullable()->after('stripe_session_id');
            $table->decimal('payment_amount', 10, 2)->nullable()->after('payment_id');
            $table->timestamp('payment_date')->nullable()->after('payment_amount');
            $table->boolean('payment_confirmed')->default(false)->after('payment_date');
            $table->string('payment_error')->nullable()->after('payment_confirmed');

            // Ajout des champs pour les remboursements
            $table->string('refund_id')->nullable()->after('payment_error');
            $table->decimal('refund_amount', 10, 2)->nullable()->after('refund_id');
            $table->timestamp('refund_date')->nullable()->after('refund_amount');

            // Ajout des champs pour les annulations
            $table->timestamp('cancelled_at')->nullable()->after('refund_date');
            $table->string('cancellation_reason')->nullable()->after('cancelled_at');

            // Index pour les recherches fréquentes
            $table->index('stripe_session_id');
            $table->index('payment_id');
            $table->index('reference');
            $table->index(['event_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            // Suppression des index
            $table->dropIndex(['stripe_session_id']);
            $table->dropIndex(['payment_id']);
            $table->dropIndex(['reference']);
            $table->dropIndex(['event_id', 'status']);

            // Suppression des colonnes
            $table->dropColumn([
                'reference',
                'stripe_session_id',
                'payment_id',
                'payment_amount',
                'payment_date',
                'payment_confirmed',
                'payment_error',
                'refund_id',
                'refund_amount',
                'refund_date',
                'cancelled_at',
                'cancellation_reason'
            ]);
        });
    }
};
