<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConfigController extends Controller
{
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

    public function database_clean()
    {
        try {
            $defaultConnection = config('database.default');
            $database = config("database.connections.{$defaultConnection}.database");

            $tables = DB::select("
            SELECT
                TABLE_NAME as name,
                TABLE_ROWS as rows,
                CREATE_TIME as created_at,
                UPDATE_TIME as updated_at,
                TABLE_COLLATION as collation,
                ENGINE as engine,
                DATA_LENGTH + INDEX_LENGTH as size
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME
        ", [$database]);

            // Formater la taille en MB
            foreach ($tables as $table) {
                $table->size = number_format($table->size / 1024 / 1024, 2) . ' MB';
                // Obtenir le nombre réel d'enregistrements
                $table->rows = DB::table($table->name)->count();
            }

            return inertia('backend/config/database-clean', [
                'tables' => $tables
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des tables : ' . $e->getMessage());

            return inertia('config/database-clean', [
                'tables' => [],
                'error' => 'Une erreur est survenue lors de la récupération des tables.'
            ]);
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

            // Log de l'action
            Log::warning("Tentative de vidage de la table {$table} par l'utilisateur " . Auth::user()->email);

            DB::beginTransaction();

            // Désactiver les contraintes foreign key temporairement
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Vider la table
            DB::table($table)->truncate();

            // Réactiver les contraintes
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            DB::commit();

            // Log du succès
            Log::info("Table {$table} vidée avec succès par " . Auth::user()->email);

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
            // Vérifier si la table existe
            $exists = DB::select("SHOW TABLES LIKE ?", [$table]);
            if (empty($exists)) {
                throw new \Exception('Table inexistante.');
            }

            // Log de l'action
            Log::info("Optimisation de la table {$table} par " . Auth::user()->email);

            // Optimiser la table
            DB::statement("OPTIMIZE TABLE `{$table}`");

            return back()->with('success', "La table {$table} a été optimisée avec succès.");
        } catch (\Exception $e) {
            Log::error("Erreur lors de l'optimisation de la table {$table}: " . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }
}
