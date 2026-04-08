<?php

namespace Tests\Feature\Smoke;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class QueueHealthCheckCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['queue.default' => 'database']);
    }

    public function test_queue_health_check_passes_when_thresholds_are_respected(): void
    {
        DB::table('jobs')->insert([
            'queue' => 'default',
            'payload' => json_encode(['job' => 'Tests\\DummyJob']),
            'attempts' => 0,
            'reserved_at' => null,
            'available_at' => time(),
            'created_at' => time(),
        ]);

        $this->artisan('queue:health-check --max-pending=10 --max-failed=10 --max-oldest-minutes=60')
            ->assertExitCode(0);
    }

    public function test_queue_health_check_fails_when_oldest_pending_job_is_too_old(): void
    {
        DB::table('jobs')->insert([
            'queue' => 'default',
            'payload' => json_encode(['job' => 'Tests\\DummyJob']),
            'attempts' => 0,
            'reserved_at' => null,
            'available_at' => time() - 3600,
            'created_at' => time() - 3600,
        ]);

        $this->artisan('queue:health-check --max-pending=10 --max-failed=10 --max-oldest-minutes=5')
            ->assertExitCode(1);
    }
}
