<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
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
        // dd($blogs);
        return inertia('frontend/blogs/index');
    }

    public function blog_detail($slug)
    {
        return inertia('frontend/blogs/show');
    }
}
