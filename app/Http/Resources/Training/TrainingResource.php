<?php

namespace App\Http\Resources\Training;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TrainingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'startDate' => $this->start_date->toISOString(),
            'endDate' => $this->end_date->toISOString(),
            'location' => $this->location,
            'coverImage' => $this->featured_image,
            'isFeatured' => $this->is_featured,
            'price' => (float) $this->price,
            'maxParticipants' => $this->max_participants,
            'tags' => $this->tags ?? [],
            'slug' => $this->slug,
            'content' => $this->content,
            'views' => $this->views,
            'isPublished' => $this->is_published,
            'publishedAt' => $this->published_at ? $this->published_at->toISOString() : null,

            // Champs additionnels spécifiques aux trainings
            'durationInDays' => $this->duration_in_days,
            'availableSeats' => $this->available_seats,
            'reservedSeats' => $this->reserved_seats,
            'isFull' => $this->is_full,
            'isUpcoming' => $this->is_upcoming,
            'isOngoing' => $this->is_ongoing,
            'canRegister' => $this->can_register,
            'occupancyRate' => $this->occupancy_rate,

            // Relations
            'participants' => $this->when(
                $this->relationLoaded('participants'),
                $this->participants->count()
            ),
        ];
    }
}
