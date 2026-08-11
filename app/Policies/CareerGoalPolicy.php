<?php
namespace App\Policies;
use App\Models\CareerGoal; use App\Models\User;
class CareerGoalPolicy {
 public function view(User $user,CareerGoal $goal): bool{return $goal->user_id===$user->id;}
 public function update(User $user,CareerGoal $goal): bool{return $goal->user_id===$user->id;}
 public function delete(User $user,CareerGoal $goal): bool{return $goal->user_id===$user->id;}
}
