<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventContact extends Model
{
    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'event_type',
        'event_name',
        'event_date',
        'source',
        'file_source',
        'imported_at',
        'notes',
    ];

    protected $casts = [
        'event_date' => 'date',
        'imported_at' => 'datetime',
    ];
}
