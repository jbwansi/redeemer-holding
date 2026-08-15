<?php

return [
    'allowed_environments' => ['local', 'staging'],
    'dataset_id' => env('ACCEPTANCE_DATASET_ID', 'A383-v1'),
    'accounts' => [
        'admin' => ['name' => 'TEST A383 Admin', 'email' => env('ACCEPTANCE_ADMIN_EMAIL')],
        'client' => ['name' => 'TEST A383 Client', 'email' => env('ACCEPTANCE_CLIENT_EMAIL')],
        'forbidden' => ['name' => 'TEST A383 Client Forbidden', 'email' => env('ACCEPTANCE_FORBIDDEN_EMAIL')],
    ],
    'password' => env('ACCEPTANCE_TEST_PASSWORD'),
];
