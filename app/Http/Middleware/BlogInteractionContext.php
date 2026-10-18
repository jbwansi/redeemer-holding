<?php

namespace App\Http\Middleware;

use App\Models\Post;
use App\Services\Blog\BlogActorService;
use Closure;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class BlogInteractionContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');
        try {
            $request->attributes->set('blog_post', Post::published()->where('slug', $request->route('slug'))->firstOrFail());
            $actor = app(BlogActorService::class)->resolve($request);
            $request->attributes->set('blog_actor', $actor);
            if (! $request->isMethod('GET') && ! $request->routeIs('blogs.interaction-session') && ! $actor) {
                abort(403, 'Initialisez votre session de participation.');
            }
            // Invoke actor limits after resolution: Laravel prioritizes route
            // ThrottleRequests middleware before custom context middleware.
            $throttle = app(\Illuminate\Routing\Middleware\ThrottleRequests::class);
            $handler = $next;
            if ($request->routeIs('blogs.comments.store')) {
                $handler = fn ($request) => $throttle->handle($request, $next, 'blog-comment');
            }
            $response = match (true) {
                $request->routeIs('blogs.interaction-session') => $throttle->handle($request, $handler, 'blog-initialize'),
                ! $request->isMethod('GET') => $throttle->handle($request, $handler, 'blog-write'),
                default => $handler($request),
            };
        } catch (Throwable $exception) {
            $handler = app(ExceptionHandler::class);
            $handler->report($exception);
            $response = $handler->render($request, $exception);
        }
        $response->headers->set('Cache-Control', 'private, no-store');
        $response->setVary('Cookie', false);

        return $response;
    }
}
