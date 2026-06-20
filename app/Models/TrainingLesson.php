<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingLesson extends Model
{
    protected  $fillable = [
       'id',
       'training_id',
       'training_section_id',
       'title',
       'slug',
       'excerpt',
       'content',
       'video_url',
       'video_duration',
       'thumbnail',
       'sort_order',
       'is_free',
       'is_published',
       'created_at',
       'updated_at',
    ];

    public function training()
    {
        return $this->belongsTo(Training::class);
    }
    
    public function section()
    {
        return $this->belongsTo(TrainingSection::class, 'training_section_id');
    }

    public function progress()
    {
        return $this->hasOne(TrainingProgress::class, 'training_lesson_id');
    }

    public function resources()
    {
        return $this->hasMany(TrainingResource::class, 'training_lesson_id')
            ->orderBy('sort_order');
    }
}
