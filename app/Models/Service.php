<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name',
        'content',
        'icon',
        'slug',
        'views',
        'excerpt',
        'user_id',
        'status',
    ];
}
