<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;

class BackupController
{
    public function export()
    {
        // Only allow admin users
        if (!Auth::user() || Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

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
        exec($command);

        return response()->download($path)->deleteFileAfterSend(true);
    }
}
