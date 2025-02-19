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
        $blogs = Post::with(['categories', "user"])->latest()->get();
        return inertia('frontend/blogs/index');
    }

    public function blog_detail($slug)
    {
        return inertia('frontend/blogs/show');
    }
    public function events()
    {
        $events = new EventCollection(Event::with(['category'])->published()->get());

        $categories = EventCategory::orderBy('name')->withCount('events')->get();
        $featuredEvent = Event::with(['category'])->where('is_featured', true)->published()->first();
        return inertia('frontend/events/index', ['events' => $events, 'categories' => $categories, 'featuredEvent' => $featuredEvent]);
    }
}
