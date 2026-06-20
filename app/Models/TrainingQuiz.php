<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingQuiz extends Model
{
    protected $fillable = [
        'training_id',
        'training_section_id',
        'title',
        'description',
        'passing_score',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'passing_score' => 'integer',
    ];

    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    public function section()
    {
        return $this->belongsTo(TrainingSection::class, 'training_section_id');
    }

    public function questions()
    {
        return $this->hasMany(TrainingQuizQuestion::class)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function attempts()
    {
        return $this->hasMany(TrainingQuizAttempt::class);
    }
}
