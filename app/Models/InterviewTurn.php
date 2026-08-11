<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewTurn extends Model
{
    use HasFactory;
    protected $guarded = [];
    protected $casts = ['metadata' => 'array', 'answered_at' => 'datetime'];
    public function simulation(): BelongsTo { return $this->belongsTo(InterviewSimulation::class, 'interview_simulation_id'); }
}
