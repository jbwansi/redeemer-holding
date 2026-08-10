<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Training extends Model
{
    use SoftDeletes;

    protected $table = 'trainings';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'start_date',
        'end_date',
        'location',
        'featured_image',
        'user_id',
        'max_participants',
        'price',
        'views',
        'is_published',
        'is_featured',
        'published_at',
        'tags',
        'meeting_link',
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

    public function participants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class, 'training_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->where('published_at', '<=', now());
    }

    public function getFeaturedImageAttribute($value)
    {
        if (empty($value)) {
            return [];
        }

        try {
            // In Laravel 10+, the 'array' cast may already decode the value before
            // reaching this accessor. Handle both a raw JSON string and a PHP array.
            if (is_array($value)) {
                $images = $value;
            } else {
                $decoded = json_decode($value, true);
                $images = is_string($decoded) ? json_decode($decoded, true) : $decoded;
            }

            if (!is_array($images)) {
                return [];
            }

            // Transform relative paths into full storage URLs
            return array_map(function ($image) {
                if (!is_array($image)) {
                    return asset('storage/' . $image);
                }

                return array_map(function ($path) {
                    return asset('storage/' . $path);
                }, $image);
            }, $images);
        } catch (\Exception $e) {
            Log::error('Erreur lors du décodage des images de la formation:', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Scope pour les trainings à venir
     */
    public function scopeUpcoming($query)
    {
        return $query->where('end_date', '>=', now());
    }

    /**
     * Scope pour les trainings passées
     */
    public function scopePast($query)
    {
        return $query->where('end_date', '<', now());
    }

    protected $appends = ['reserved_seats', 'available_seats'];

    /**
     * Nombre total de places réservées pour cette formation
     */
    public function getReservedSeatsAttribute(): int
    {
        return $this->participants()
            ->whereNotIn('status', ['cancelled'])
            ->sum('qty');
    }

    /**
     * Nombre de places encore disponibles pour cette formation
     */
    public function getAvailableSeatsAttribute(): int
    {
        if ($this->max_participants === null) {
            return PHP_INT_MAX; // Pas de limite
        }

        return max(0, $this->max_participants - $this->reserved_seats);
    }

    /**
     * Vérifie si la formation est complète
     */
    public function getIsFullAttribute(): bool
    {
        if ($this->max_participants === null) {
            return false;
        }

        return $this->available_seats <= 0;
    }

    /**
     * Vérifie si la formation est à venir
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->end_date >= now();
    }

    /**
     * Vérifie si la formation est en cours
     */
    public function getIsOngoingAttribute(): bool
    {
        $now = now();
        return $this->start_date <= $now && $this->end_date >= $now;
    }

    /**
     * Pourcentage de remplissage de la formation
     */
    public function getOccupancyRateAttribute(): ?float
    {
        if ($this->max_participants === null || $this->max_participants === 0) {
            return null;
        }

        return ($this->reserved_seats / $this->max_participants) * 100;
    }

    /**
     * Vérifie si la formation peut accepter de nouvelles inscriptions
     */
    public function getCanRegisterAttribute(): bool
    {
        return !$this->is_full &&
            $this->is_published &&
            now() < $this->start_date;
    }

    /**
     * Durée de la formation en jours
     */
    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Incrémenter le compteur de vues
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function lessons()
    {
        return $this->hasMany(TrainingLesson::class)
            ->orderBy('sort_order');
    }

    public function sections()
    {
        return $this->hasMany(TrainingSection::class)
            ->orderBy('sort_order');
    }

    public function progressPercentage(User $user): int
    {
        return app(\App\Services\LearningProgressService::class)
            ->progressPercentage($this, $user);
    }
}
