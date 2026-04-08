<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class QueueHealthCheck extends Command
{
    protected $signature = 'queue:health-check
        {--max-pending=300 : Maximum pending jobs allowed}
        {--max-failed=20 : Maximum failed jobs allowed}
        {--max-oldest-minutes=20 : Maximum age in minutes for oldest pending job}';

    protected $description = 'Check queue health and fail when thresholds are exceeded';

    public function handle(): int
    {
        $queueDriver = (string) config('queue.default');

        if ($queueDriver !== 'database') {
            $this->warn("Queue driver is '{$queueDriver}', database-specific checks skipped.");
            return self::SUCCESS;
        }

        if (!Schema::hasTable('jobs') || !Schema::hasTable('failed_jobs')) {
            $this->warn('Queue tables not found (jobs/failed_jobs). Health check skipped.');
            return self::SUCCESS;
        }

        $maxPending = (int) $this->option('max-pending');
        $maxFailed = (int) $this->option('max-failed');
        $maxOldestMinutes = (int) $this->option('max-oldest-minutes');

        $pendingJobs = DB::table('jobs')->whereNull('reserved_at')->count();
        $failedJobs = DB::table('failed_jobs')->count();

        $oldestPendingTimestamp = DB::table('jobs')
            ->whereNull('reserved_at')
            ->min('created_at');

        $oldestPendingAgeMinutes = 0;

        if ($oldestPendingTimestamp !== null) {
            $oldestPendingAgeMinutes = max(0, (int) floor((time() - (int) $oldestPendingTimestamp) / 60));
        }

        $this->info('Queue health report');
        $this->table(
            ['Metric', 'Value', 'Threshold'],
            [
                ['Pending jobs', (string) $pendingJobs, (string) $maxPending],
                ['Failed jobs', (string) $failedJobs, (string) $maxFailed],
                ['Oldest pending (min)', (string) $oldestPendingAgeMinutes, (string) $maxOldestMinutes],
            ]
        );

        $isHealthy = $pendingJobs <= $maxPending
            && $failedJobs <= $maxFailed
            && $oldestPendingAgeMinutes <= $maxOldestMinutes;

        if ($isHealthy) {
            $this->info('Queue health check passed.');
            return self::SUCCESS;
        }

        Log::warning('Queue health check failed', [
            'pending_jobs' => $pendingJobs,
            'failed_jobs' => $failedJobs,
            'oldest_pending_minutes' => $oldestPendingAgeMinutes,
            'thresholds' => [
                'max_pending' => $maxPending,
                'max_failed' => $maxFailed,
                'max_oldest_minutes' => $maxOldestMinutes,
            ],
        ]);

        $this->error('Queue health check failed: one or more thresholds were exceeded.');

        return self::FAILURE;
    }
}
