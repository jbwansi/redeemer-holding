<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ConfigController extends Controller
{

    // Database backup page stub
    public function database_backup()
    {
        return inertia('backend/config/database-backup');
    }

    // Database logs page stub
    public function database_logs()
    {
        return inertia('backend/config/database-logs');
    }


public function index()
{
      $defaultConnection = config('database.default');
                $database = config("database.connections.{$defaultConnection}.database");
    
    $tables = DB::select("
        SELECT
            TABLE_NAME AS name,
            TABLE_ROWS AS table_rows,
            CREATE_TIME AS created_at,
            UPDATE_TIME AS updated_at,
            TABLE_COLLATION AS collation,
            ENGINE AS engine,
            ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb,
            CONCAT(ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2), ' MB') AS size
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME
    ", [$database]);

    // For compatibility with frontend expecting 'rows', map table_rows to rows
    foreach ($tables as $table) {
        $table->rows = (int) ($table->table_rows ?? 0);
    }

    $totalTables = count($tables);
    $totalRows = collect($tables)->sum(fn ($table) => (int) ($table->rows ?? 0));
    $totalSize = collect($tables)->sum(fn ($table) => (float) ($table->size_mb ?? 0));
    $mainEngine = collect($tables)
        ->pluck('engine')
        ->filter()
        ->countBy()
        ->sortDesc()
        ->keys()
        ->first();

        

    return inertia('backend/config/database-index', [
        'database' => $database,
        'driver' => config('database.default'),
        'tables' => $tables,
        'totalTables' => $totalTables,
        'totalRows' => $totalRows,
        'totalSize' => $totalSize,
        'mainEngine' => $mainEngine,
    ]);
}



public function system()
    {
        return inertia('backend/config/system');
    }

    public function changelog()
    {
        return inertia('backend/config/changelog');
    }

    public function activation()
    {
        return inertia('backend/config/activation');
    }

    public function social_login()
    {
        return inertia('backend/config/social-login');
    }

    public function system_execute(Request $request)
    {
        $command = $request->input('command');
        try {
            Artisan::call($command);
            return back()->with('success', 'Commande exécutée avec succès');
        } catch (\Exception $e) {
            return back()->with('error', 'Erreur lors de l\'exécution de la commande');
        }
    }


    public function truncate(Request $request, string $table)
    {
        try {
            // Vérifications de sécurité
            $protectedTables = ['users', 'roles', 'permissions', 'migrations', 'personal_access_tokens'];

            if (in_array($table, $protectedTables)) {
                throw new \Exception('Cette table ne peut pas être vidée pour des raisons de sécurité.');
            }

            $userEmail = Auth::user()?->email ?? 'guest';

            // Log de l'action
            Log::warning("Tentative de vidage de la table {$table} par l'utilisateur " . $userEmail);

            DB::beginTransaction();

            $driver = DB::connection()->getDriverName();
            if ($driver === 'sqlite') {
                DB::table($table)->delete();
                $hasSqliteSequence = DB::selectOne("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'");
                if ($hasSqliteSequence) {
                    DB::statement("DELETE FROM sqlite_sequence WHERE name = ?", [$table]);
                }
            } else {
                DB::statement('SET FOREIGN_KEY_CHECKS=0');
                DB::table($table)->truncate();
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }

            DB::commit();

            // Log du succès
            Log::info("Table {$table} vidée avec succès par " . $userEmail);

            return back()->with('success', "La table {$table} a été vidée avec succès.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors du vidage de la table {$table}: " . $e->getMessage());

            return back()->with('error', $e->getMessage());
        }
    }

    public function optimize(Request $request, string $table)
    {
        try {
            $driver = DB::connection()->getDriverName();

            if ($driver !== 'sqlite') {
                // Vérifier si la table existe
                $exists = DB::select("SHOW TABLES LIKE ?", [$table]);
                if (empty($exists)) {
                    throw new \Exception('Table inexistante.');
                }
            }

            $userEmail = Auth::user()?->email ?? 'guest';

            // Log de l'action
            Log::info("Optimisation de la table {$table} par " . $userEmail);

            if ($driver === 'sqlite') {
                DB::statement('VACUUM');
            } else {
                DB::statement("OPTIMIZE TABLE `{$table}`");
            }

            return back()->with('success', "La table {$table} a été optimisée avec succès.");
        } catch (\Exception $e) {
            Log::error("Erreur lors de l'optimisation de la table {$table}: " . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }
}
