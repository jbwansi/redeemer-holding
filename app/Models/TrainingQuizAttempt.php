<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingQuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'training_id',
        'training_section_id',
        'training_quiz_id',
        'total_questions',
        'correct_answers',
        'score',
        'passed',
        'answers',
        'started_at',
        'submitted_at',
    ];

    protected $casts = [
        'passed' => 'boolean',
        'answers' => 'array',
        'score' => 'decimal:2',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quiz()
    {
        return $this->belongsTo(TrainingQuiz::class, 'training_quiz_id');
    }
}
