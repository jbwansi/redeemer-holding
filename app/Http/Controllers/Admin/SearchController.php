<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Formation;
use App\Models\Post;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function global(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'users' => [],
                'events' => [],
                'formations' => [],
                'posts' => [],
                'services' => [],
            ]);
        }

        $users = User::query()
            ->select(['id', 'name', 'email'])
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'title' => $user->name,
                'subtitle' => $user->email,
                'url' => route('users.show', $user->id),
                'type' => 'Utilisateur',
            ]);

        $events = Event::query()
            ->select(['id', 'slug', 'title'])
            ->where('title', 'like', "%{$q}%")
            ->limit(5)
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'subtitle' => 'Evenement',
                'url' => route('events.show', $event->slug),
                'type' => 'Evenement',
            ]);

        $formations = Formation::query()
            ->select(['id', 'slug', 'title'])
            ->where('title', 'like', "%{$q}%")
            ->limit(5)
            ->get()
            ->map(fn ($formation) => [
                'id' => $formation->id,
                'title' => $formation->title,
                'subtitle' => 'Formation',
                'url' => route('formations.show', $formation->slug),
                'type' => 'Formation',
            ]);

        $posts = Post::query()
            ->select(['id', 'title'])
            ->where('title', 'like', "%{$q}%")
            ->limit(5)
            ->get()
            ->map(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'subtitle' => 'Article',
                'url' => route('posts.edit', $post->id),
                'type' => 'Article',
            ]);

        $services = Service::query()
            ->select(['id', 'name'])
            ->where('name', 'like', "%{$q}%")
            ->limit(5)
            ->get()
            ->map(fn ($service) => [
                'id' => $service->id,
                'title' => $service->name,
                'subtitle' => 'Service',
                'url' => route('services.edit', $service->id),
                'type' => 'Service',
            ]);

        return response()->json([
            'users' => $users,
            'events' => $events,
            'formations' => $formations,
            'posts' => $posts,
            'services' => $services,
        ]);
    }
}
