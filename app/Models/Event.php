<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'start_date',
        'end_date',
        'location',
        'featured_image',
        'category_id',
        'user_id',
        'max_participants',
        'price',
        'views',
        'is_published',
        'is_featured',
        'published_at',
        'tags',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'published_at' => 'datetime',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'views' => 'integer',
        'featured_image' => 'array',
        'tags' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(EventCategory::class);
    }

    // public function participants()
    // {
    //     return $this->hasMany(EventParticipant::class);
    // }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->where('published_at', '<=', now());
    }
    // public function reviews(): MorphMany
    // {
    //     return $this->morphMany(Review::class, 'reviewable');
    // }
    public function getFeaturedImageAttribute($value)
    {
        if (empty($value)) {
            return [];
        }

        try {
            // Première décodage
            $decodedOnce = json_decode($value, true);

            // Si c'est une chaîne après le premier décodage, on décode une seconde fois
            if (is_string($decodedOnce)) {
                $images = json_decode($decodedOnce, true);
            } else {
                $images = $decodedOnce;
            }

            if (!is_array($images)) {
                return [];
            }

            // Transformer les chemins en URLs complètes
            return array_map(function ($image) {
                if (!is_array($image)) {
                    return asset('storage/' . $image);
                }

                return array_map(function ($path) {
                    return asset('storage/' . $path);
                }, $image);
            }, $images);
        } catch (\Exception $e) {
            Log::error('Erreur lors du décodage des images:', [
                'error' => $e->getMessage(),
                'value' => $value
            ]);
            return [];
        }
    }
}
