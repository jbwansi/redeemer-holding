<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class DeploymentPreflight extends Command
{
    protected $signature = 'deployment:preflight';

    protected $description = 'Check database state before running deployment migrations';

    public function handle(): int
    {
        try {
            DB::select('select 1');
        } catch (Throwable $exception) {
            $this->error('Connexion à la base impossible : '.$exception->getMessage());

            return self::FAILURE;
        }

        $driver = DB::connection()->getDriverName();
        $this->info("Connexion base de données réussie ({$driver}).");

        $safe = $this->checkRenamePair('formations', 'trainings');
        $safe = $this->checkRenamePair(
            'formation_participants',
            'training_participants'
        ) && $safe;

        if (Schema::hasTable('migrations')) {
            $tracked = DB::table('migrations')
                ->whereIn('migration', [
                    '2026_05_17_075828_rename_formations_table_to_trainings_table',
                    '2026_05_17_080408_rename_formation_participants_table_to_training_participants_table',
                    '2026_05_17_081701_update_training_participants_foreign_key',
                ])
                ->pluck('migration');

            $this->line('Migrations historiques enregistrées : '.$tracked->count().'/3.');
        } else {
            $this->warn('Table migrations absente : installation neuve ou incomplète.');
        }

        if (!$safe) {
            $this->error('Preflight refusé. Sauvegardez puis résolvez explicitement l’état ambigu.');

            return self::FAILURE;
        }

        $this->info('Preflight migrations réussi. Aucune coexistence dangereuse détectée.');

        return self::SUCCESS;
    }

    private function checkRenamePair(string $legacy, string $current): bool
    {
        $legacyExists = Schema::hasTable($legacy);
        $currentExists = Schema::hasTable($current);

        if ($legacyExists && $currentExists) {
            $this->error("État ambigu : {$legacy} et {$current} coexistent.");

            return false;
        }

        if (!$legacyExists && !$currentExists) {
            $this->error("État incomplet : ni {$legacy} ni {$current} n’existe.");

            return false;
        }

        $state = $legacyExists ? "renommage {$legacy} → {$current} en attente" : "{$current} présente";
        $this->line("OK : {$state}.");

        return true;
    }
}
