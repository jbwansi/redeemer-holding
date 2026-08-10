<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Services\LearningProgressService;

class TrainingProgressController extends Controller
{
    public function complete(Training $training, TrainingLesson $lesson)
    {
        app(LearningProgressService::class)->markLessonCompleted($training, $lesson, auth()->user());

        return back()->with('success', 'Leçon marquée comme terminée.');
    }

    public function uncomplete(Training $training, TrainingLesson $lesson)
    {
        app(LearningProgressService::class)->markLessonIncomplete($training, $lesson, auth()->user());

        return back()->with('success', 'Leçon marquée comme non terminée.');
    }
}
