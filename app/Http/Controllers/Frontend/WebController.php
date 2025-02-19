<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Post\PostCollection;
use App\Http\Resources\Post\PostResource;
use App\Models\Category;
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
        return inertia('frontend/blogs/index', ['posts' => $posts, 'categories' => $categories, 'featuredPost' => $featuredPost]);
    }

    public function blog_detail($slug)
    {
        return inertia('frontend/blogs/show');
    }
}
