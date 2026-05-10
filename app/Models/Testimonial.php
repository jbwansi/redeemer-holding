<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
    'name',
    'role',
    'company',
    'photo',
    'message',
    'rating',
    'is_active',
    'is_featured',
    'position',
    'service_id',
];

protected $casts = [
    'is_active' => 'boolean',
    'is_featured' => 'boolean',
    'rating' => 'integer',
    'position' => 'integer',
];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
