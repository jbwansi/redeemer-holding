<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingQuizQuestion extends Model
{
    protected $fillable = [
        'training_quiz_id',
        'question',
        'options',
        'correct_option_index',
        'sort_order',
        'points',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_option_index' => 'integer',
        'sort_order' => 'integer',
        'points' => 'integer',
    ];

    public function quiz()
    {
        return $this->belongsTo(TrainingQuiz::class, 'training_quiz_id');
    }
}
