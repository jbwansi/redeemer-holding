<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\ListPostCommentsRequest;
use App\Http\Requests\Blog\StorePostCommentRequest;
use App\Http\Resources\Post\PostCommentResource;
use App\Services\Blog\PostCommentService;
use Illuminate\Http\JsonResponse;

class PostCommentController extends Controller
{
    public function index(ListPostCommentsRequest $request): JsonResponse
    {
        $comments = $request->attributes->get('blog_post')->approvedComments()
            ->orderByDesc('created_at')->orderByDesc('id')
            ->paginate(10, ['id', 'display_name', 'body', 'created_at']);

        return response()->json([
            'data' => PostCommentResource::collection($comments->getCollection())->resolve($request),
            'meta' => [
                'current_page' => $comments->currentPage(), 'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(), 'total' => $comments->total(),
            ],
        ]);
    }

    public function store(StorePostCommentRequest $request, PostCommentService $comments): JsonResponse
    {
        $comments->submit($request->attributes->get('blog_post'), $request->attributes->get('blog_actor'),
            $request->validated());

        return response()->json(['message' => 'Votre commentaire a été reçu et sera soumis à modération.'], 202);
    }
}
