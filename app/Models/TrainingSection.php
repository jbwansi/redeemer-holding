<?php

namespace App\Models;

use App\Models\Concerns\HasStableId;
use Illuminate\Database\Eloquent\Model;

class TrainingSection extends Model
{
    use HasStableId;

    protected $fillable = [
        'training_id',
        'stable_id',
        'title',
        'description',
        'sort_order',
        'is_published',
    ];

    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    public function lessons()
    {
        return $this->hasMany(TrainingLesson::class)
            ->orderBy('sort_order');
    }

    public function quiz()
    {
        return $this->hasOne(TrainingQuiz::class, 'training_section_id');
    }
}
