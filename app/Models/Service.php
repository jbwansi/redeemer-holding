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
    'image',
    'tagline',
    'featured_note',
    'cta_primary_label',
    'cta_primary_url',
    'cta_secondary_label',
    'cta_secondary_url',
    'position',
    'ideal_for',

    'is_featured',
    'featured_badge',
    'featured_order',
  ];

  protected $casts = [
    'ideal_for' => 'array',
    'is_featured' => 'boolean',
    'featured_order' => 'integer',
  ];
}
