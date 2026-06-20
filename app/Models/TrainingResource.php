<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingResource extends Model
{
    protected $fillable = [
        'training_lesson_id',
        'title',
        'description',
        'file_path',
        'external_url',
        'file_disk',
        'file_type',
        'is_downloadable',
        'is_public',
        'sort_order',
    ];

    protected $casts = [
        'is_downloadable' => 'boolean',
        'is_public' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function lesson()
    {
        return $this->belongsTo(TrainingLesson::class, 'training_lesson_id');
    }
}