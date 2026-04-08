<?php

namespace App\Http\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use App\Services\SeoService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'app' => [
                'env' => app()->environment(),
                'is_test_env' => app()->environment(['staging', 'testing']),
            ],
            'seo' => fn () => SeoService::defaults(),
            'auth' => function () use ($request) {
                return [
                    'user' => $request->user()
                        ? Auth::user()
                        : null,
                ];
            },
            'flash' => function () use ($request) {
                return [
                    'success' => $request->session()->get('success'),
                    'error' => $request->session()->get('error'),
                ];
            },
            'notifications' => function () use ($request) {
                $user = $request->user();

                if (!$user || !Schema::hasTable('notifications')) {
                    return [
                        'unread_count' => 0,
                        'items' => [],
                    ];
                }

                $items = $user->unreadNotifications()
                    ->latest()
                    ->limit(8)
                    ->get()
                    ->map(function ($notification) {
                        $data = (array) ($notification->data ?? []);
                        $url = $data['url'] ?? null;

                        if (!$url && isset($data['service_request_id'])) {
                            $url = route('service-requests.show', $data['service_request_id']);
                        }

                        return [
                            'id' => $notification->id,
                            'title' => $data['title'] ?? 'Notification',
                            'message' => $data['message'] ?? 'Vous avez une nouvelle notification.',
                            'type' => $data['type'] ?? 'info',
                            'url' => $url,
                            'created_at' => optional($notification->created_at)?->diffForHumans(),
                        ];
                    })
                    ->values();

                return [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'items' => $items,
                ];
            },
        ]);
    }
}
