<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Formation extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'is_featured',
        'tags',
        'featured_image',
        'location',
        'start_date',
        'end_date',
        'price',
        'max_participants',
        'views',
        'is_published',
        'published_at',
        'user_id'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'tags' => 'array',
        'featured_image' => 'array',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'price' => 'decimal:2',
        'max_participants' => 'integer',
        'views' => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->where('published_at', '<=', Carbon::now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', Carbon::now());
    }

    // Accessors & Mutators
    public function getDurationAttribute(): int
    {
        return Carbon::parse($this->start_date)->diffInDays($this->end_date);
    }

    public function getIsAvailableAttribute(): bool
    {
        if (!$this->max_participants) {
            return true;
        }

        // Ici vous devrez implémenter la logique pour compter les inscriptions
        // return $this->registrations()->count() < $this->max_participants;
        return true;
    }

    // Helpers
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function publish(): void
    {
        $this->update([
            'is_published' => true,
            'published_at' => Carbon::now(),
        ]);
    }

    public function unpublish(): void
    {
        $this->update([
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}
