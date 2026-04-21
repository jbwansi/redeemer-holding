<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('key')->nullable()->after('id');
        });

        // ⚠️ Optionnel : si tu veux éviter les conflits, tu peux remplir automatiquement
        // des clés pour les anciennes lignes (sinon laisse comme ça)

        Schema::table('settings', function (Blueprint $table) {
            $table->unique('key');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique(['key']);
            $table->dropColumn('key');
        });
    }
};