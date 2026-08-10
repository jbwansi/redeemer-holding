<?php

namespace App\Policies;

use App\Models\EventParticipant;
use App\Models\User;

class EventParticipantPolicy
{
    public function view(User $user, EventParticipant $participant): bool
    {
        return $user->can('administer')
            || (int) $participant->user_id === (int) $user->id;
    }

    public function update(User $user, EventParticipant $participant): bool
    {
        return $this->view($user, $participant);
    }
}
