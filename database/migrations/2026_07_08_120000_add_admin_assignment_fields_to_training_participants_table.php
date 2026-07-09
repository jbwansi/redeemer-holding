<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_participants', function (Blueprint $table) {
            if (!Schema::hasColumn('training_participants', 'assigned_by_admin_id')) {
                $table->foreignId('assigned_by_admin_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('training_participants', 'cancelled_by_admin_id')) {
                $table->foreignId('cancelled_by_admin_id')
                    ->nullable()
                    ->after('assigned_by_admin_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('training_participants', function (Blueprint $table) {
            if (Schema::hasColumn('training_participants', 'cancelled_by_admin_id')) {
                $table->dropConstrainedForeignId('cancelled_by_admin_id');
            }

            if (Schema::hasColumn('training_participants', 'assigned_by_admin_id')) {
                $table->dropConstrainedForeignId('assigned_by_admin_id');
            }
        });
    }
};
