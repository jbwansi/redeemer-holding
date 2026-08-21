<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const TABLES = ['training_sections', 'training_resources', 'training_quiz_questions'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->uuid('stable_id')->nullable();
            });

            DB::table($table)->select('id')->orderBy('id')->chunkById(500, function ($rows) use ($table): void {
                foreach ($rows as $row) {
                    DB::table($table)->where('id', $row->id)->update(['stable_id' => (string) Str::uuid()]);
                }
            });

            Schema::table($table, function (Blueprint $blueprint) use ($table): void {
                $blueprint->unique('stable_id', $table.'_stable_id_unique');
            });
        }
    }

    public function down(): void
    {
        foreach (array_reverse(self::TABLES) as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table): void {
                $blueprint->dropUnique($table.'_stable_id_unique');
                $blueprint->dropColumn('stable_id');
            });
        }
    }
};
