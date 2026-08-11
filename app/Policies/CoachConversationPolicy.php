<?php
namespace App\Policies;
use App\Models\CoachConversation; use App\Models\User;
class CoachConversationPolicy { public function view(User $user, CoachConversation $conversation): bool { return $conversation->user_id === $user->id; } public function update(User $user, CoachConversation $conversation): bool { return $this->view($user, $conversation); } public function delete(User $user, CoachConversation $conversation): bool { return $this->view($user, $conversation); } }
