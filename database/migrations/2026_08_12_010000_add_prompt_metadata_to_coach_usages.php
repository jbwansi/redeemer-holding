<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('coach_usages', function (Blueprint $table): void {
            $table->string('prompt_key', 100)->nullable()->after('model');
            $table->string('prompt_version', 32)->nullable()->after('prompt_key');
        });
    }

    public function down(): void
    {
        Schema::table('coach_usages', function (Blueprint $table): void {
            $table->dropColumn(['prompt_key', 'prompt_version']);
        });
    }
};
