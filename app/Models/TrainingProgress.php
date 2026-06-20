<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingProgress extends Model
{
    protected $fillable = [
        'user_id',
        'training_id',
        'training_lesson_id',
        'completed',
        'completed_at',
        'watch_time',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    public function lesson()
    {
        return $this->belongsTo(TrainingLesson::class, 'training_lesson_id');
    }
    
}
