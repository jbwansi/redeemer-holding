<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingProgress;
use App\Models\TrainingParticipant;
use App\Services\LearningProgressService;

class TrainingProgressController extends Controller
{
    public function complete(Training $training, TrainingLesson $lesson)
    {
        $this->authorizeAccess($training, $lesson);

        TrainingProgress::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'training_id' => $training->id,
                'training_lesson_id' => $lesson->id,
            ],
            [
                'training_id' => $training->id,
                'completed' => true,
                'completed_at' => now(),
            ]
        );

        app(LearningProgressService::class)->clearSectionProgressCache(
            auth()->id(),
            $training->id,
            $lesson->training_section_id
        );

        return back()->with('success', 'Leçon marquée comme terminée.');
    }

    public function uncomplete(Training $training, TrainingLesson $lesson)
    {
        $this->authorizeAccess($training, $lesson);

        TrainingProgress::where('user_id', auth()->id())
            ->where('training_id', $training->id)
            ->where('training_lesson_id', $lesson->id)
            ->update([
                'completed' => false,
                'completed_at' => null,
            ]);

        app(LearningProgressService::class)->clearSectionProgressCache(
            auth()->id(),
            $training->id,
            $lesson->training_section_id
        );

        return back()->with('success', 'Leçon marquée comme non terminée.');
    }

    private function authorizeAccess(Training $training, TrainingLesson $lesson): void
    {
        abort_unless((int) $lesson->training_id === (int) $training->id, 404);

        $query = TrainingParticipant::where('training_id', $training->id)
            ->where('user_id', auth()->id())
            ->whereIn('status', [
                TrainingParticipant::STATUS_REGISTERED,
                TrainingParticipant::STATUS_CONFIRMED,
                TrainingParticipant::STATUS_IN_PROGRESS,
                TrainingParticipant::STATUS_COMPLETED,
            ]);

        if ((float) $training->price > 0) {
            $query->where('payment_confirmed', true);
        }

        abort_unless($query->exists(), 403);
    }
}