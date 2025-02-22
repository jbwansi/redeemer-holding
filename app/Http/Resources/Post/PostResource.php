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
        // Vérifier si le contenu existe avant de calculer le temps de lecture
        $content = $this->content ?? '';
        $wordCount = str_word_count(strip_tags($content));
        $readTimeMinutes = ceil($wordCount / 200);

        return [
            'id' => $this->id ?? null,
            'slug' => $this->slug ?? null,
            'title' => $this->title ?? null,
            'excerpt' => $this->excerpt ?? null,
            'content' => $content,
            'coverImage' => $this->featured_image ?? null,
            'category' => $this->categories?->first()?->name ?? null,
            'author' => [
                'name' => $this->user?->name ?? 'Anonyme',
                'avatar' => $this->user?->avatar ?? "/assets/images/avatar.jpg",
                "bio" => $this->user?->bio ?? "Pas de biographie",
            ],
            'publishedAt' => $this->created_at ?? null,
            'readTime' => $readTimeMinutes . " min de lecture",
            'tags' => $this->tags ?? [],
            "views" => $this->views ?? 0
        ];
    }
}
