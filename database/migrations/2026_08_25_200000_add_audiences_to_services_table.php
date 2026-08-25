<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->boolean('is_for_individuals')->default(false)->after('status');
            $table->boolean('is_for_organizations')->default(false)->after('is_for_individuals');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['is_for_individuals', 'is_for_organizations']);
        });
    }
};
