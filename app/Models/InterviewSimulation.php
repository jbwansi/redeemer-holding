<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InterviewSimulation extends Model
{
    use HasFactory;

    public const STATUSES = ['draft', 'ready', 'in_progress', 'completed', 'cancelled'];
    public const TYPES = ['general', 'behavioral', 'technical', 'management', 'leadership'];
    public const DIFFICULTIES = ['easy', 'standard', 'advanced'];

    protected $guarded = [];
    protected $casts = [
        'analysis' => 'array', 'strengths' => 'array', 'improvements' => 'array',
        'recommended_actions' => 'array', 'questions_to_rehearse' => 'array',
        'candidate_questions' => 'array', 'completed_at' => 'datetime',
        'document_ids' => 'array',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function conversation(): BelongsTo { return $this->belongsTo(CoachConversation::class, 'coach_conversation_id'); }
    public function turns(): HasMany { return $this->hasMany(InterviewTurn::class)->orderBy('position'); }
    public function currentTurn(): ?InterviewTurn { return $this->turns()->where('position', $this->current_turn)->first(); }
    public function progressPercentage(): int { $total = $this->turns()->count(); return $total === 0 ? 0 : (int) round($this->turns()->whereNotNull('answered_at')->count() / $total * 100); }
}
