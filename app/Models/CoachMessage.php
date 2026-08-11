<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoachMessage extends Model
{
    use HasFactory;
    protected $guarded = [];
    protected $casts = ['structured_data' => 'array'];
    public function conversation(): BelongsTo { return $this->belongsTo(CoachConversation::class, 'coach_conversation_id'); }
}
