<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostRating extends Model
{
    protected $fillable = ['post_id', 'blog_actor_id', 'rating'];

    protected $hidden = ['blog_actor_id', 'actor', 'submission_key', 'content_hash'];

    protected $casts = ['rating' => 'integer'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(BlogActor::class, 'blog_actor_id');
    }
}
