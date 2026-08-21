<?php

return [
    'max_files' => 500,
    'max_total_uncompressed' => 250 * 1024 * 1024,
    'max_file_uncompressed' => 100 * 1024 * 1024,
    'max_compression_ratio' => 200,
    'allowed_disks' => ['public', 'local'],
];
