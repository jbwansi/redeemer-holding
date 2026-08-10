<?php

namespace App\Policies;

use App\Models\TrainingParticipant;
use App\Models\User;

class TrainingParticipantPolicy
{
    public function view(User $user, TrainingParticipant $participant): bool
    {
        return $user->can('administer')
            || (int) $participant->user_id === (int) $user->id;
    }

    public function update(User $user, TrainingParticipant $participant): bool
    {
        return $this->view($user, $participant);
    }
}
