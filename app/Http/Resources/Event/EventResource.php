<?php

namespace App\Http\Resources\Event;


use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        // Récupérer la première image comme coverImage
        $coverImage = !empty($this->featured_image)
            ? asset('storage/' . $this->featured_image[0])
            : asset('storage/events/default.webp');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->start_date->toISOString(),
            'endDate' => $this->end_date->toISOString(),
            'location' => $this->location,
            'coverImage' => $coverImage,
            'category' => $this->category ? $this->category->name : null,
            'isFeatured' => $this->is_featured,
            'price' => (float) $this->price,
            'capacity' => $this->max_participants,
            'tags' => $this->tags ?? [],

            // Champs additionnels optionnels que vous pourriez vouloir ajouter
            'slug' => $this->slug,
            'content' => $this->content,
            'views' => $this->views,
            'isPublished' => $this->is_published,
            'publishedAt' => $this->published_at ? $this->published_at->toISOString() : null,
        ];
    }
}
