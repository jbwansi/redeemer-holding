<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('email');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('status')->default('pending')->after('source');
            $table->string('consent_status')->default('pending')->after('status');
            $table->string('consent_source')->nullable()->after('consent_status');
            $table->timestamp('consent_verified_at')->nullable()->after('consent_source');
            $table->text('consent_proof')->nullable()->after('consent_verified_at');
            $table->timestamp('imported_at')->nullable()->after('subscribed_at');
        });
    }

    public function down(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'status',
                'consent_status',
                'consent_source',
                'consent_verified_at',
                'consent_proof',
                'imported_at',
            ]);
        });
    }
};
