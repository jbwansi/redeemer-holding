<?php

namespace App\Policies;

use App\Models\CoachAnalysis;
use App\Models\User;

class CoachAnalysisPolicy
{
    public function view(User $user, CoachAnalysis $analysis): bool { return $analysis->user_id === $user->id; }
    public function update(User $user, CoachAnalysis $analysis): bool { return $analysis->user_id === $user->id; }
    public function delete(User $user, CoachAnalysis $analysis): bool { return $analysis->user_id === $user->id; }
}
