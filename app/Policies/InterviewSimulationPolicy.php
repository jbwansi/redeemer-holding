<?php

namespace App\Policies;

use App\Models\InterviewSimulation;
use App\Models\User;

class InterviewSimulationPolicy
{
    public function view(User $user, InterviewSimulation $simulation): bool { return $simulation->user_id === $user->id; }
    public function update(User $user, InterviewSimulation $simulation): bool { return $this->view($user, $simulation); }
    public function delete(User $user, InterviewSimulation $simulation): bool { return $this->view($user, $simulation); }
}
