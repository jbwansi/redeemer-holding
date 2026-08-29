<?php

return [
    'live_send_enabled' => filter_var(
        env('NEWSLETTER_LIVE_SEND_ENABLED', false),
        FILTER_VALIDATE_BOOL,
    ),
];
