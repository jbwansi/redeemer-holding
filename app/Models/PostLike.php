<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostLike extends Model
{
    protected $fillable = ['post_id', 'blog_actor_id'];

    protected $hidden = ['blog_actor_id', 'actor', 'submission_key', 'content_hash'];

    protected $casts = [];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(BlogActor::class, 'blog_actor_id');
    }
}
