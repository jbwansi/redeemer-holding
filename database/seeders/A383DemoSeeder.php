<?php

namespace Database\Seeders;

use App\Services\AcceptanceDatasetService;
use Illuminate\Database\Seeder;
use RuntimeException;

class A383DemoSeeder extends Seeder
{
    public const LOCAL_ADMIN_EMAIL = 'a383-admin@localhost.test';

    public const LOCAL_CLIENT_EMAIL = 'a383-client@localhost.test';

    public const LOCAL_FORBIDDEN_EMAIL = 'a383-forbidden@localhost.test';

    public const LOCAL_PASSWORD = 'A383-local-demo-2026!';

    public function run(): void
    {
        $service = app(AcceptanceDatasetService::class);
        $service->assertAllowedEnvironment();
        if (app()->environment('local')) {
            $this->configureLocalDefaults();
        }

        $plan = $service->inspect();
        if ($plan['dependencies'] || $plan['conflicts']) {
            throw new RuntimeException('Dataset A383 refusé : '.implode(' ', [...$plan['dependencies'], ...$plan['conflicts']]));
        }

        $manifest = $service->provision($plan);
        $this->command?->info('Dataset A383 prêt : '.$manifest['run_id']);
    }

    private function configureLocalDefaults(): void
    {
        config([
            'acceptance.accounts' => [
                'admin' => ['name' => 'TEST A383 Admin', 'email' => self::LOCAL_ADMIN_EMAIL],
                'client' => ['name' => 'TEST A383 Client', 'email' => self::LOCAL_CLIENT_EMAIL],
                'forbidden' => ['name' => 'TEST A383 Client Forbidden', 'email' => self::LOCAL_FORBIDDEN_EMAIL],
            ],
            'acceptance.password' => self::LOCAL_PASSWORD,
            'mail.staging.allowed_recipients' => [self::LOCAL_CLIENT_EMAIL],
        ]);
    }
}
