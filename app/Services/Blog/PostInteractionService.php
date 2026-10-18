<?php

namespace App\Services\Blog;

use App\Models\BlogActor;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\PostRating;

class PostInteractionService
{
    public function summary(Post $post, ?BlogActor $actor): array
    {
        // ENUM values map to 1–5 on MySQL; numeric coercion is also supported by SQLite.
        $ratings = $post->ratings()->selectRaw('COUNT(*) AS total, AVG(rating + 0) AS average')->first();

        return [
            'likes_count' => $post->likes()->count(),
            'liked' => $actor ? $post->likes()->where('blog_actor_id', $actor->id)->exists() : false,
            'ratings_count' => (int) $ratings->total,
            'rating_average' => $ratings->average === null ? null : round((float) $ratings->average, 2),
            'my_rating' => $actor ? $post->ratings()->where('blog_actor_id', $actor->id)->first()?->rating : null,
            'comments_count' => $post->approvedComments()->count(),
        ];
    }

    public function like(Post $post, BlogActor $actor, bool $liked): void
    {
        $key = ['post_id' => $post->id, 'blog_actor_id' => $actor->id];
        if ($liked) {
            PostLike::query()->firstOrCreate($key);
        } else {
            PostLike::query()->where($key)->delete();
        }
    }

    public function rate(Post $post, BlogActor $actor, ?int $rating): void
    {
        $key = ['post_id' => $post->id, 'blog_actor_id' => $actor->id];
        if ($rating === null) {
            PostRating::query()->where($key)->delete();
        } else {
            PostRating::query()->upsert([$key + ['rating' => $rating]], ['post_id', 'blog_actor_id'], ['rating', 'updated_at']);
        }
    }
}
