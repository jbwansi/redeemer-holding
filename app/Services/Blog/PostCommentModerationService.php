<?php

namespace App\Services\Blog;

use App\Models\PostComment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class PostCommentModerationService
{
    public const TRANSITIONS = [
        'pending' => ['approved', 'rejected', 'spam'],
        'approved' => ['rejected', 'spam'],
        'rejected' => ['pending'],
        'spam' => ['pending'],
    ];

    public function moderate(PostComment $comment, User $administrator, string $status, int $expectedVersion, ?string $reason): void
    {
        Gate::forUser($administrator)->authorize('administer');
        abort_unless($administrator->is_active, 403);

        DB::transaction(function () use ($comment, $administrator, $status, $expectedVersion, $reason) {
            $locked = PostComment::query()->lockForUpdate()->findOrFail($comment->id);
            // The latest audit ID is a monotonic revision, including A -> B -> A.
            // Timestamp precision and equal current statuses cannot hide a conflict.
            $version = (int) $locked->moderationLogs()->max('id');
            if ($version !== $expectedVersion) {
                throw ValidationException::withMessages([
                    'conflict' => 'Ce commentaire a été modifié par un autre administrateur. Rechargez la liste avant de réessayer.',
                ]);
            }
            if (! in_array($status, self::TRANSITIONS[$locked->status] ?? [], true)) {
                throw ValidationException::withMessages(['status' => 'Cette transition de statut est interdite.']);
            }
            $previous = $locked->status;
            $locked->update(['status' => $status]);
            $locked->moderationLogs()->create([
                'moderator_id' => $administrator->id,
                'from_status' => $previous,
                'to_status' => $status,
                'reason' => $reason,
            ]);
        }, 3);
    }
}
