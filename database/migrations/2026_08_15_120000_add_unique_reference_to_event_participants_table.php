<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasDuplicateReference = DB::table('event_participants')
            ->select('reference')
            ->whereNotNull('reference')
            ->groupBy('reference')
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        if ($hasDuplicateReference) {
            throw new \RuntimeException(
                'Impossible de rendre les références événement uniques : des doublons existent déjà.'
            );
        }

        Schema::table('event_participants', function (Blueprint $table) {
            $table->unique('reference', 'event_participants_reference_unique');
        });
    }

    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropUnique('event_participants_reference_unique');
        });
    }
};
