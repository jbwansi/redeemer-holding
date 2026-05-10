<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\SeoService;
use App\Http\Resources\Post\PostCollection;
use App\Http\Resources\Post\PostResource;
use App\Models\Category;
use App\Models\Post;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\DynamicMailerService;
use App\Models\PostViewLog;

class BlogController extends Controller
{

    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }

    public function blogs(Request $request)
    {
        $postsPaginator = Post::with(['user', 'categories'])
            ->published()
            ->latest()
            ->paginate(9)
            ->appends($request->query());

        $posts = PostResource::collection($postsPaginator);
        $featuredModel = Post::with(['user', 'categories'])->published()->latest()->first();
        $featuredPost = $featuredModel ? PostResource::make($featuredModel) : null;
        $categories = Category::orderBy('name')->withCount('posts')->get();
        //recuperer toutes les tags des posts
        $tags = [];
        foreach ($postsPaginator->items() as $post) {
            foreach ($post->tags ?? [] as $tag) {
                array_push($tags, $tag);
            }
        }

        return inertia('frontend/blogs/index', [
            'tags' => $tags,
            'posts' => $posts,
            'categories' => $categories,
            'featuredPost' => $featuredPost,
            'seo' => SeoService::page('Blog', 'Articles sur la transformation personnelle, le développement personnel et le coaching.'),
        ]);
    }

    public function blog_detail($slug)
    {
        $post = Post::with(['user', 'categories'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $blog = PostResource::make($post);

        $categoryids = $post->categories->pluck('id');


        $relatedposts = post::with(['user', 'categories'])
            ->published()
            ->where('id', '!=', $post->id)
            ->when($categoryids->isnotempty(), function ($query) use ($categoryids) {
                $query->wherehas('categories', function ($q) use ($categoryids) {
                    $q->wherein('categories.id', $categoryids);
                });
            })
            ->latest()
            ->take(3)
            ->get();

        $cacheKey = "viewed_post_{$post->id}_" . request()->ip();

        if (!Cache::has($cacheKey)) {
            PostViewLog::create([
                'post_id' => $post->id,
                'user_id' => auth()->id(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $post->increment('views');

            Cache::put($cacheKey, true, now()->addHours(1));
        }

        $postImage = SeoService::firstImageUrl($post->featured_image ?? []);

        return inertia('frontend/blogs/show', [
            'post' => $blog,
            'relatedPosts' => new PostCollection($relatedposts),
            'seo' => SeoService::article(
                $post->title ?? $post->name ?? '',
                $post->excerpt ?? $post->description ?? '',
                $postImage,
                optional($post->published_at)->toIso8601String() ?? now()->toIso8601String(),
                optional($post->user)->name ?? '',
            ),
        ]);
    }

}
