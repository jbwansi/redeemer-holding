<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostRequest;
use App\Models\Category;
use App\Models\Post;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PostController extends Controller
{

    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }


    public function index()
    {
        return inertia('backend/blogs/posts/index', [
            'posts' => Post::with('categories')->latest()->get()
        ]);
    }

    public function create()
    {
        return inertia('backend/blogs/posts/create', [
            'categories' => Category::orderBy('name')->get()
        ]);
    }

    public function store(PostRequest $request)
    {
        try {
            $validated = $request->validated();

            // Créer d'abord le post sans l'image
            $post = Post::create([
                ...$validated,
                'user_id' => Auth::id(),
                'slug' => rand(1000, 9999) . '-' . Str::slug($validated['title']),
                'featured_image' => null // Initialiser à null
            ]);

            if ($request->hasFile('featured_image')) {
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'posts',
                    $this->imageService->generateImageVersions()
                );

                // Mettre à jour le post avec le JSON des images
                $post->featured_image = json_encode($images);
                $post->save();
            }

            if (isset($validated['category_ids'])) {
                $post->categories()->attach($validated['category_ids']);
            }

            return redirect()
                ->route('posts.index')
                ->with('success', 'Article créé avec succès.');
        } catch (\Exception $e) {
            report($e);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()])
                ->withInput();
        }
    }


    public function destroy(Post $post)
    {
        try {
            if ($post->featured_image) {
                $this->imageService->deleteImages(json_decode($post->featured_image, true));
            }

            $post->delete();

            return redirect()
                ->route('posts.index')
                ->with('success', 'Article supprimé avec succès.');
        } catch (\Exception $e) {
            report($e);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue.']);
        }
    }


    public function edit(Post $post)
    {

        return inertia('backend/blogs/posts/edit', [
            'post' => [
                ...$post->toArray(),
                'featured_image' => $post->featured_image['medium'] ?? null,
                // 'featured_image' => $post->featured_image ?
                //     asset('storage/' . $post->featured_image['medium']) : null,
                'categories' => $post->categories->pluck('id')->toArray()
            ],
            'categories' => Category::select('id', 'name')->get()
        ]);
    }

    public function update(PostRequest $request, Post $post)
    {
        try {
            $validated = $request->validated();

            // Mettre à jour les données de base
            $post->fill([
                ...$validated,
                'slug' => rand(1000, 9999) . '-' . Str::slug($validated['title'])
            ]);

            if ($request->hasFile('featured_image')) {
                // Supprimer les anciennes images
                if ($post->featured_image) {
                    $this->imageService->deleteImages(json_decode($post->featured_image, true));
                }

                // Uploader les nouvelles images
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'posts',
                    $this->imageService->generateImageVersions()
                );

                // Encoder en JSON avant de sauvegarder
                $post->featured_image = json_encode($images);
            }

            $post->save();

            if (isset($validated['category_ids'])) {
                $post->categories()->sync($validated['category_ids']);
            }

            return redirect()
                ->route('posts.index')
                ->with('success', 'Article mis à jour avec succès.');
        } catch (\Exception $e) {
            report($e);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Une erreur est survenue: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function trash()
    {
        return inertia('blogs/posts/trash', [
            'posts' => Post::onlyTrashed()
                // ->with([
                //     'categories' => function ($query) {
                //         $query->withTrashed();
                //     },
                //     'user' // Si vous avez besoin des infos de l'utilisateur
                // ])
                // ->latest()
                ->get()
        ]);
    }
}
