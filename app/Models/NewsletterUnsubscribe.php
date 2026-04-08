<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterUnsubscribe extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'source',
        'campaign_id',
        'unsubscribed_at',
    ];

    protected $casts = [
        'unsubscribed_at' => 'datetime',
    ];
}
