<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogActor extends Model
{
    protected $fillable = ['user_id', 'kind', 'token_hash', 'expires_at'];

    protected $hidden = ['id', 'user_id', 'token_hash', 'expires_at', 'kind'];

    protected $casts = ['expires_at' => 'immutable_datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(PostRating::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }
}
