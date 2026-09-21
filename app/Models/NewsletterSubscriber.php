<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'source',
        'status',
        'consent_status',
        'consent_source',
        'consent_verified_at',
        'consent_proof',
        'subscribed_at',
        'imported_at',
        'confirmation_token',
        'confirmation_sent_at',
        'confirmed_at',
    ];

    protected $casts = [
        'subscribed_at' => 'datetime',
        'imported_at' => 'datetime',
        'consent_verified_at' => 'datetime',
        'confirmation_sent_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];
}
