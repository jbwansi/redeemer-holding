<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'title',
        'excerpt',
        'content',
        'featured_image',
        'published',
        'published_at',
        'user_id',
        'viewed',
        "tags"
    ];

    protected $casts = [
        'published' => 'boolean',
        'published_at' => 'datetime',
        "tags" => "array"
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_post');
    }

    public function scopePublished($query)
    {
        return $query->where('published', true)
            ->where('published_at', '<=', now());
    }


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
