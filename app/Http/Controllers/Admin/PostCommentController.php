<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModeratePostCommentRequest;
use App\Models\Post;
use App\Models\PostComment;
use App\Services\Blog\PostCommentModerationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Response;

class PostCommentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('administer');
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(array_keys(PostCommentModerationService::TRANSITIONS))],
            'post_id' => ['nullable', 'integer', 'exists:posts,id'],
            'page' => ['nullable', 'integer', 'min:1', 'max:10000'],
        ]);
        $comments = PostComment::query()
            ->with(['post' => fn ($query) => $query->withTrashed()->select('id', 'title', 'deleted_at')])
            ->withMax('moderationLogs as moderation_version', 'id')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['post_id'] ?? null, fn ($query, $postId) => $query->where('post_id', $postId))
            ->orderByDesc('created_at')->orderByDesc('id')
            ->paginate(20)->withQueryString()
            ->through(fn (PostComment $comment) => [
                'id' => $comment->id,
                'display_name' => $comment->display_name,
                'body' => $comment->body,
                'status' => $comment->status,
                'created_at' => $comment->created_at->toIso8601String(),
                'version' => (int) $comment->moderation_version,
                'allowed_statuses' => PostCommentModerationService::TRANSITIONS[$comment->status] ?? [],
                'post' => ['id' => $comment->post->id, 'title' => $comment->post->title, 'deleted' => $comment->post->trashed()],
            ]);

        return inertia('backend/blogs/comments/index', [
            'comments' => $comments,
            'filters' => ['status' => $filters['status'] ?? '', 'post_id' => (string) ($filters['post_id'] ?? '')],
            'posts' => Post::withTrashed()->whereHas('comments')->orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function update(ModeratePostCommentRequest $request, PostComment $comment, PostCommentModerationService $moderation): RedirectResponse
    {
        $data = $request->validated();
        $moderation->moderate($comment, $request->user(), $data['status'], (int) $data['expected_version'], $data['reason'] ?? null);

        return back()->with('success', 'Le statut du commentaire a été mis à jour.');
    }
}
