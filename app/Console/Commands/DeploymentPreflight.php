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

        $tracked = $this->trackedHistoricalMigrations();

        if ($this->isFreshDatabase($tracked)) {
            $this->info('Fresh database : aucun schéma applicatif ni migration enregistrée.');
            $this->info('Preflight migrations réussi. Les migrations initiales peuvent être exécutées.');

            return self::SUCCESS;
        }

        $trainingState = $this->renamePairState('formations', 'trainings');
        $participantState = $this->renamePairState(
            'formation_participants',
            'training_participants'
        );

        $safe = $trainingState !== null && $participantState !== null;

        if ($safe && $trainingState !== $participantState) {
            $this->error('État incohérent : les tables formations et participants ne sont pas de la même génération.');
            $safe = false;
        }

        if ($safe && !$this->trackedMigrationsMatchSchema($tracked, $trainingState, $participantState)) {
            $safe = false;
        }

        if (Schema::hasTable('migrations')) {
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

    private function renamePairState(string $legacy, string $current): ?string
    {
        $legacyExists = Schema::hasTable($legacy);
        $currentExists = Schema::hasTable($current);

        if ($legacyExists && $currentExists) {
            $this->error("État ambigu : {$legacy} et {$current} coexistent.");

            return null;
        }

        if (!$legacyExists && !$currentExists) {
            $this->error("État incomplet : ni {$legacy} ni {$current} n’existe.");

            return null;
        }

        $state = $legacyExists ? "renommage {$legacy} → {$current} en attente" : "{$current} présente";
        $this->line("OK : {$state}.");

        return $legacyExists ? 'legacy' : 'modern';
    }

    private function trackedHistoricalMigrations()
    {
        if (!Schema::hasTable('migrations')) {
            return collect();
        }

        return DB::table('migrations')
            ->whereIn('migration', $this->historicalMigrations())
            ->pluck('migration');
    }

    private function historicalMigrations(): array
    {
        return [
            '2026_05_17_075828_rename_formations_table_to_trainings_table',
            '2026_05_17_080408_rename_formation_participants_table_to_training_participants_table',
            '2026_05_17_081701_update_training_participants_foreign_key',
        ];
    }

    private function isFreshDatabase($tracked): bool
    {
        if ($tracked->isNotEmpty()) {
            return false;
        }

        $ignored = ['migrations', 'sqlite_sequence'];
        $applicationTables = collect(Schema::getTableListing())
            ->map(fn (string $table): string => str_contains($table, '.') ? substr($table, strrpos($table, '.') + 1) : $table)
            ->reject(fn (string $table): bool => in_array($table, $ignored, true));

        return $applicationTables->isEmpty();
    }

    private function trackedMigrationsMatchSchema($tracked, string $trainingState, string $participantState): bool
    {
        $trainingRename = $this->historicalMigrations()[0];
        $participantRename = $this->historicalMigrations()[1];

        if ($tracked->contains($trainingRename) && $trainingState !== 'modern') {
            $this->error('État incohérent : la migration formations est enregistrée mais la table moderne est absente.');

            return false;
        }

        if ($tracked->contains($participantRename) && $participantState !== 'modern') {
            $this->error('État incohérent : la migration participants est enregistrée mais la table moderne est absente.');

            return false;
        }

        return true;
    }
}
