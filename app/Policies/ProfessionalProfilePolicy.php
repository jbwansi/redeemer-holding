<?php
namespace App\Policies;
use App\Models\ProfessionalProfile; use App\Models\User;
class ProfessionalProfilePolicy { public function view(User $user, ProfessionalProfile $profile): bool { return $profile->user_id === $user->id; } public function update(User $user, ProfessionalProfile $profile): bool { return $this->view($user, $profile); } }
