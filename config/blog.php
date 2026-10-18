<?php

return [
    'anonymous_cookie' => 'redeemer_blog_actor',
    // Fixed lifetime: reading the cookie never extends this deadline.
    'anonymous_lifetime_minutes' => 60 * 24 * 180,
    'comments' => [
        'minimum_seconds' => 3,
        'form_lifetime_seconds' => 3600,
        'duplicate_window_seconds' => 600,
        'max_links' => 2,
    ],
    'limits' => [
        'network_per_minute' => 120,
        'initializations_per_minute' => 10,
        'writes_per_minute' => 30,
        'comments_per_ten_minutes' => 3,
        'comments_per_day' => 10,
    ],
];
