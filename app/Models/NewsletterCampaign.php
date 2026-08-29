<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'headline',
        'content',
        'cta_text',
        'cta_url',
        'segments',
        'custom_emails',
        'status',
        'total_recipients',
        'sent_count',
        'failed_count',
        'queued_at',
        'scheduled_at',
        'started_at',
        'completed_at',
        'created_by',
    ];

    protected $casts = [
        'segments' => 'array',
        'custom_emails' => 'array',
        'queued_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}
