<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->string('confirmation_token')->nullable()->unique()->after('source');
            $table->timestamp('confirmation_sent_at')->nullable()->after('confirmation_token');
            $table->timestamp('confirmed_at')->nullable()->after('confirmation_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->dropUnique(['confirmation_token']);
        });

        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->dropColumn([
                'confirmation_token',
                'confirmation_sent_at',
                'confirmed_at',
            ]);
        });
    }
};
