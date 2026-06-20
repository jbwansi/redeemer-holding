<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingProgress;
use Illuminate\Http\Request;

class TrainingProgressController extends Controller
{
    public function complete(Training $training, TrainingLesson $lesson)
    {
        $this->authorizeAccess($training, $lesson);

        TrainingProgress::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'training_lesson_id' => $lesson->id,
            ],
            [
                'training_id' => $training->id,
                'completed' => true,
                'completed_at' => now(),
            ]
        );

        return back()->with('success', 'Leçon marquée comme terminée.');
    }

    public function uncomplete(Training $training, TrainingLesson $lesson)
    {
        $this->authorizeAccess($training, $lesson);

        TrainingProgress::where('user_id', auth()->id())
            ->where('training_lesson_id', $lesson->id)
            ->update([
                'completed' => false,
                'completed_at' => null,
            ]);

        return back()->with('success', 'Leçon marquée comme non terminée.');
    }

    private function authorizeAccess(Training $training, TrainingLesson $lesson): void
    {
        abort_unless((int) $lesson->training_id === (int) $training->id, 404);

        $query = \App\Models\TrainingParticipant::where('training_id', $training->id)
            ->where('user_id', auth()->id())
            ->where('status', \App\Models\TrainingParticipant::STATUS_COMPLETED);

        if ((float) $training->price > 0) {
            $query->where('payment_confirmed', true);
        }

        $hasAccess = $query->exists();

        abort_unless($hasAccess, 403);
    }
}