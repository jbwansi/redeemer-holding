<?php
namespace App\Policies;
use App\Models\UserDocument; use App\Models\User;
class UserDocumentPolicy { public function view(User $user, UserDocument $document): bool { return $document->user_id === $user->id; } public function delete(User $user, UserDocument $document): bool { return $this->view($user, $document); } }
