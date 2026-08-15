<?php

namespace App\Console\Commands;

use App\Services\AcceptanceDatasetService;
use Illuminate\Console\Command;
use Throwable;

class AcceptanceCleanup extends Command
{
    protected $signature = 'acceptance:cleanup {run-id} {--dry-run : Vérifier sans supprimer} {--apply : Supprimer exactement le manifeste}';

    protected $description = 'Nettoie un dataset de recette à partir de son manifeste exact';

    public function handle(AcceptanceDatasetService $service): int
    {
        if (! app()->environment('staging')) {
            $this->error('Refus absolu hors staging.');

            return self::FAILURE;
        }
        try {
            $manifest = $service->cleanupPlan((string) $this->argument('run-id'), true);
            $this->line(json_encode(['run_id' => $manifest['run_id'], 'tables' => array_map('count', $manifest['rows']), 'files' => $manifest['files']], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            if (! $this->option('apply')) {
                $this->info('DRY-RUN cleanup : aucune suppression.');

                return self::SUCCESS;
            }
            $service->cleanup($manifest['run_id']);
            $this->info('Cleanup exact réussi.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
