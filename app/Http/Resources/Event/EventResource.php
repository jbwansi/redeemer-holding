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


        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->start_date->toISOString(),
            'endDate' => $this->end_date->toISOString(),
            'location' => $this->location,
            'coverImage' => $this->featured_image,
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
