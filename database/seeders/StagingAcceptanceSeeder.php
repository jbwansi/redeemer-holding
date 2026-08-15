<?php

namespace Database\Seeders;

use App\Services\AcceptanceDatasetService;
use Illuminate\Database\Seeder;
use RuntimeException;

class StagingAcceptanceSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('staging')) {
            throw new RuntimeException('Refus absolu : StagingAcceptanceSeeder est réservé à APP_ENV=staging.');
        }

        $service = app(AcceptanceDatasetService::class);
        $plan = $service->inspect();
        if ($plan['dependencies'] || $plan['conflicts']) {
            throw new RuntimeException('Dataset A383 refusé : '.implode(' ', [...$plan['dependencies'], ...$plan['conflicts']]));
        }

        $manifest = $service->provision($plan);
        $this->command?->info('Dataset acceptance prêt : '.$manifest['run_id']);
    }
}
