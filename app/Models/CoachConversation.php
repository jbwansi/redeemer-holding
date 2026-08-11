<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoachConversation extends Model
{
    use HasFactory;
    public const MODULES = ['general', 'interview', 'cv', 'career', 'certification'];
    protected $guarded = [];
    protected $casts = ['context' => 'array', 'archived_at' => 'datetime'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function messages(): HasMany { return $this->hasMany(CoachMessage::class); }
}
