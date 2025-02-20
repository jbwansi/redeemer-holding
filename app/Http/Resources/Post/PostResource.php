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

        // Calculer le temps de lecture (environ 200 mots par minute)
        $wordCount = str_word_count(strip_tags($this->content));
        $readTimeMinutes = ceil($wordCount / 200);

        // Récupérer la première image comme coverImage
        $coverImage = $this->featured_image ?? null;

        // Récupérer la première catégorie
        $category = $this->categories->first();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'coverImage' => $coverImage,
            'category' => $category ? $category->name : null,
            'author' => [
                'name' => $this->user->name,
                'avatar' => $this->user->avatar ?? "/assets/images/avatar.jpg"
            ],
            'publishedAt' => Carbon::parse($this->published_at)->locale('fr')->isoFormat('D MMMM YYYY'),
            'readTime' => $readTimeMinutes . " min de lecture",
            'tags' => $this->tags ?? [],
            "views" => $this->views
        ];
    }
}
