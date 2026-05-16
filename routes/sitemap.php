<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;

/*
|--------------------------------------------------------------------------
| Sitemap Routes
|--------------------------------------------------------------------------
*/

Route::controller(SitemapController::class)
    ->prefix('sitemap')
    ->name('sitemap.')
    ->group(function () {

        Route::get('/index.xml', 'index')
            ->name('index');

        Route::get('/static.xml', 'staticPages')
            ->name('static');

        Route::get('/events.xml', 'events')
            ->name('events');

        Route::get('/trainings.xml', 'trainings')
            ->name('trainings');

        Route::get('/posts.xml', 'posts')
            ->name('posts');

        Route::get('/services.xml', 'services')
            ->name('services');
    });


// Main sitemap alias
Route::get('/sitemap.xml', [SitemapController::class, 'main'])
    ->name('sitemap');