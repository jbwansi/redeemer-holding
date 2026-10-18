<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostCommentModerationLog extends Model
{
    protected $fillable = ['post_comment_id', 'moderator_id', 'from_status', 'to_status', 'reason'];

    protected $hidden = ['moderator_id', 'reason', 'moderator'];

    protected $casts = [];

    public function comment(): BelongsTo
    {
        return $this->belongsTo(PostComment::class, 'post_comment_id');
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }
}
