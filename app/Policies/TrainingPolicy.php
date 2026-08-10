<?php

namespace App\Policies;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;

class TrainingPolicy
{
    public function viewLearning(User $user, Training $training): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (!$training->is_published) {
            return false;
        }

        $participants = TrainingParticipant::query()
            ->where('training_id', $training->id)
            ->where('user_id', $user->id)
            ->whereIn('status', [
                TrainingParticipant::STATUS_REGISTERED,
                TrainingParticipant::STATUS_CONFIRMED,
                TrainingParticipant::STATUS_IN_PROGRESS,
                TrainingParticipant::STATUS_COMPLETED,
            ]);

        if ((float) $training->price > 0) {
            $participants->where('payment_confirmed', true);
        }

        return $participants->exists();
    }
}
