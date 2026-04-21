<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'source',
        'subscribed_at',
        'confirmation_token',
        'confirmation_sent_at',
        'confirmed_at',
    ];

    protected $casts = [
        'subscribed_at' => 'datetime',
        'confirmation_sent_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];
}