<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AppController extends Controller
{
    public function index() {
        return inertia("frontend/home");
    }

    public function contact()
    {
        return inertia("frontend/contact");
    }

    public function about()
    {
        return inertia("frontend/about");
    }

    public function services(){
        return inertia("frontend/services");
    }
}
