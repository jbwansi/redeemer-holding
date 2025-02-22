<?php

namespace App\Http\Resources\Post;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Si la ressource est null, retourner un tableau avec des valeurs par défaut
        if (is_null($this->resource)) {
            return [
                'id' => null,
                'slug' => null,
                'title' => null,
                'excerpt' => null,
                'content' => null,
                'coverImage' => null,
                'category' => null,
                'author' => [
                    'name' => 'Anonyme',
                    'avatar' => "/assets/images/avatar.jpg",
                    "bio" => "Pas de biographie",
                ],
                'publishedAt' => null,
                'readTime' => "0 min de lecture",
                'tags' => [],
                "views" => 0
            ];
        }

        // Si la ressource existe, calculer le temps de lecture
        $content = $this->resource->content ?? '';
        $wordCount = str_word_count(strip_tags($content));
        $readTimeMinutes = ceil($wordCount / 200);

        return [
            'id' => $this->resource->id,
            'slug' => $this->resource->slug,
            'title' => $this->resource->title,
            'excerpt' => $this->resource->excerpt,
            'content' => $content,
            'coverImage' => $this->resource->featured_image,
            'category' => $this->resource->categories?->first()?->name,
            'author' => [
                'name' => $this->resource->user?->name ?? 'Anonyme',
                'avatar' => $this->resource->user?->avatar ?? "/assets/images/avatar.jpg",
                "bio" => $this->resource->user?->bio ?? "Pas de biographie",
            ],
            'publishedAt' => $this->resource->created_at,
            'readTime' => $readTimeMinutes . " min de lecture",
            'tags' => $this->resource->tags ?? [],
            "views" => $this->resource->views ?? 0
        ];
    }
}
