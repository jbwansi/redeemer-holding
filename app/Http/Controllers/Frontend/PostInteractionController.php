<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blog\StorePostRatingRequest;
use App\Services\Blog\BlogActorService;
use App\Services\Blog\PostCommentService;
use App\Services\Blog\PostInteractionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostInteractionController extends Controller
{
    public function __construct(private PostInteractionService $interactions) {}

    public function initialize(Request $request, BlogActorService $actors, PostCommentService $comments): JsonResponse
    {
        $identity = $actors->initialize($request);
        $response = response()->json([
            'comment_form_token' => $comments->formToken($request->attributes->get('blog_post'), $identity['actor']),
        ]);
        if ($identity['cookie']) {
            $response->headers->setCookie($identity['cookie']);
        }

        return $response;
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json($this->interactions->summary(
            $request->attributes->get('blog_post'), $request->attributes->get('blog_actor'),
        ));
    }

    public function like(Request $request): JsonResponse
    {
        $this->interactions->like($request->attributes->get('blog_post'), $request->attributes->get('blog_actor'), $request->isMethod('PUT'));

        return $this->show($request);
    }

    public function rate(StorePostRatingRequest $request): JsonResponse
    {
        $this->interactions->rate($request->attributes->get('blog_post'), $request->attributes->get('blog_actor'), (int) $request->validated('rating'));

        return $this->show($request);
    }

    public function removeRating(Request $request): JsonResponse
    {
        $this->interactions->rate($request->attributes->get('blog_post'), $request->attributes->get('blog_actor'), null);

        return $this->show($request);
    }
}
