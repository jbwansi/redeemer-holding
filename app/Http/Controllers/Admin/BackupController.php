<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Gate;

class BackupController
{
    public function export()
    {
        Gate::authorize('administer');

        $filename = 'backup-' . date('Y-m-d_H-i-s') . '.sql';
        $path = storage_path('app/' . $filename);

        $db = Config::get('database.connections.mysql');
        $command = sprintf(
            'mysqldump -u%s -p%s %s > "%s"',
            escapeshellarg($db['username']),
            escapeshellarg($db['password']),
            escapeshellarg($db['database']),
            $path
        );
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            abort(500, 'Backup failed');
        }

        if (!file_exists($path)) {
            abort(500, 'Backup file not created');
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }
}
