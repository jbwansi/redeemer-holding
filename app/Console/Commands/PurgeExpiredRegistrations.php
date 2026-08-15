<?php

namespace App\Console\Commands;

use App\Models\EventParticipant;
use App\Models\TrainingParticipant;
use Illuminate\Console\Command;

class PurgeExpiredRegistrations extends Command
{
    protected $signature = 'registrations:purge-expired';

    protected $description = 'Cancel expired unpaid training and event registrations';

    public function handle(): int
    {
        $trainingCount = TrainingParticipant::purgeExpiredRegistrations();
        $eventCount = EventParticipant::purgeExpiredRegistrations();

        $this->info("Expired registrations purged: training={$trainingCount}, event={$eventCount}.");

        return self::SUCCESS;
    }
}