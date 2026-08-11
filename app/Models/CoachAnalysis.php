<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoachAnalysis extends Model
{
    use HasFactory;

    public const TYPES = ['cv_job_match', 'cv_improvement', 'cover_letter', 'application_message', 'skills_gap', 'certification_recommendation', 'learning_plan'];

    protected $guarded = [];

    protected $casts = ['result' => 'array', 'completed_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function conversation(): BelongsTo { return $this->belongsTo(CoachConversation::class, 'coach_conversation_id'); }
    public function cvDocument(): BelongsTo { return $this->belongsTo(UserDocument::class, 'cv_document_id'); }
    public function jobDocument(): BelongsTo { return $this->belongsTo(UserDocument::class, 'job_document_id'); }
    public function careerGoal(): BelongsTo { return $this->belongsTo(CareerGoal::class); }
}
