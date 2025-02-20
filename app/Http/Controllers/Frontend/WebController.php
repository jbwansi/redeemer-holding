<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\EventCollection;
use App\Http\Resources\Post\PostCollection;
use App\Http\Resources\Post\PostResource;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\Post;
use Illuminate\Http\Request;

class WebController extends Controller
{
    public function formations()
    {
        return inertia('frontend/formations/index');
    }

    public function formation_detail($slug)
    {
        return inertia('frontend/formations/show');
    }


    public function blogs()
    {

        $posts = new PostCollection(Post::with(['user', 'categories'])->published()->latest()->get());
        $featuredPost = PostResource::make(Post::with(['user', 'categories'])->published()->latest()->first());
        $categories = Category::orderBy('name')->withCount('posts')->get();
        //recuperer toutes les tags des posts
        $tags = [];
        foreach ($posts as $post) {
            foreach ($post->tags ?? [] as $tag) {
                array_push($tags, $tag);
            }
        }

        return inertia('frontend/blogs/index', ['tags' => $tags, 'posts' => $posts, 'categories' => $categories, 'featuredPost' => $featuredPost]);
    }

    public function blog_detail($slug)
    {

        $blog = PostResource::make(Post::with(['user', 'categories'])->published()->where('slug', $slug)->first());

        return inertia('frontend/blogs/show', ['post' => $blog]);
    }
    public function events()
    {
        $events = new EventCollection(Event::with(['category'])->published()->get());

        $categories = EventCategory::orderBy('name')->withCount('events')->get();
        $featuredEvent = Event::with(['category'])->where('is_featured', true)->published()->first();
        return inertia('frontend/events/index', ['events' => $events, 'categories' => $categories, 'featuredEvent' => $featuredEvent]);
    }
}
