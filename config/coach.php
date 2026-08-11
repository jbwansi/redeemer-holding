<?php

return [
    'provider' => env('COACH_AI_PROVIDER', 'fake'),
    'monthly_message_limit' => (int) env('COACH_MONTHLY_MESSAGE_LIMIT', 100),
    'rate_limit_per_minute' => (int) env('COACH_RATE_LIMIT_PER_MINUTE', 10),
];
