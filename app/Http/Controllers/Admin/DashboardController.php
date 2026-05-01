<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Formation;
use App\Models\FormationParticipant;
use App\Models\Post;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use App\Services\GoogleAnalyticsService;

class DashboardController extends Controller
{
    public function index(GoogleAnalyticsService $ga)
    {
        // Calculer les statistiques
        $stats = [
            'events' => [
                'active' => Event::where('end_date', '>=', now())->count(),
                'total' => Event::count(),
                'trend' => $this->calculateTrend('events'),
            ],
            'trainings' => [
                'active' => Formation::where('is_published', true)->count(),
                'total' => Formation::count(),
                'trend' => $this->calculateTrend('trainings'),
            ],
            'services' => [
                'active' => Service::where('status', true)->count(),
                'total' => Service::count(),
                'trend' => $this->calculateTrend('services'),
            ],
            'posts' => [
                'published' => Post::where('published', true)->count(),
                'total' => Post::count(),
                'trend' => $this->calculateTrend('posts'),
            ],
            'users' => [
                'total' => User::count(),
                'total_last_month' => User::where('created_at', '<', now()->subMonth())->count(),
                'trend' => $this->calculateTrend('users'),
            ],
            'revenue' => [
                'current' => $this->calculateRevenue(now()->startOfMonth(), now()),
                'last_month' => $this->calculateRevenue(
                    now()->subMonth()->startOfMonth(),
                    now()->subMonth()->endOfMonth()
                ),
                'trend' => $this->calculateRevenueTrend(),
            ],
            'monthly_revenue' => $this->getMonthlyRevenue(),
            'revenue_distribution' => $this->getRevenueDistribution(),
            'activity_by_type' => $this->getActivityByType(),
            'top_content' => $this->getTopContent(),
            'queue_health' => $this->getQueueHealth(),

            'event_funnel' => $this->getEventFunnel(),
            'event_funnel_current' => $this->getEventFunnelCurrent(),
            'event_funnel_upcoming' => $this->getEventFunnelUpcoming(),
        ];


        // 🔥 Google Analytics
        try {
            $visitorsByCountry = $ga->getVisitorsByCountry();
            $gaError = null;
        } catch (\Throwable $e) {
            $visitorsByCountry = [];
            $gaError = $e->getMessage();
        }

        return inertia("backend/index", [
            'stats' => $stats,
            'visitorsByCountry' => $visitorsByCountry,
            'visitorsByDay' => $ga->getVisitorsByDay(),
            'topPages' => $ga->getTopPages(),
            'trafficSources' => $ga->getTrafficSources(),
            'gaError' => $gaError,
        ]);
    }

    private function getQueueHealth(): array
    {
        $driver = (string) config('queue.default');

        if ($driver !== 'database' || !Schema::hasTable('jobs') || !Schema::hasTable('failed_jobs')) {
            return [
                'driver' => $driver,
                'available' => false,
                'status' => 'unavailable',
                'pending_jobs' => 0,
                'failed_jobs' => 0,
                'oldest_pending_minutes' => 0,
                'thresholds' => [
                    'max_pending' => 300,
                    'max_failed' => 20,
                    'max_oldest_minutes' => 20,
                ],
            ];
        }

        $maxPending = 300;
        $maxFailed = 20;
        $maxOldestMinutes = 20;

        $pendingJobs = DB::table('jobs')->whereNull('reserved_at')->count();
        $failedJobs = DB::table('failed_jobs')->count();

        $oldestPendingTimestamp = DB::table('jobs')
            ->whereNull('reserved_at')
            ->min('created_at');

        $oldestPendingMinutes = 0;

        if ($oldestPendingTimestamp !== null) {
            $oldestPendingMinutes = max(0, (int) floor((time() - (int) $oldestPendingTimestamp) / 60));
        }

        $isHealthy = $pendingJobs <= $maxPending
            && $failedJobs <= $maxFailed
            && $oldestPendingMinutes <= $maxOldestMinutes;

        return [
            'driver' => $driver,
            'available' => true,
            'status' => $isHealthy ? 'healthy' : 'alert',
            'pending_jobs' => $pendingJobs,
            'failed_jobs' => $failedJobs,
            'oldest_pending_minutes' => $oldestPendingMinutes,
            'thresholds' => [
                'max_pending' => $maxPending,
                'max_failed' => $maxFailed,
                'max_oldest_minutes' => $maxOldestMinutes,
            ],
        ];
    }

    private function calculateTrend($type)
    {
        // Calcul basique du trend : comparer ce mois avec le mois dernier
        $currentMonth = match ($type) {
            'events' => Event::whereMonth('created_at', now()->month)->count(),
            'trainings' => Formation::whereMonth('created_at', now()->month)->count(),
            'services' => Service::whereMonth('created_at', now()->month)->count(),
            'posts' => Post::whereMonth('created_at', now()->month)->count(),
            'users' => User::whereMonth('created_at', now()->month)->count(),
        };

        $lastMonth = match ($type) {
            'events' => Event::whereMonth('created_at', now()->subMonth()->month)->count(),
            'trainings' => Formation::whereMonth('created_at', now()->subMonth()->month)->count(),
            'services' => Service::whereMonth('created_at', now()->subMonth()->month)->count(),
            'posts' => Post::whereMonth('created_at', now()->subMonth()->month)->count(),
            'users' => User::whereMonth('created_at', now()->subMonth()->month)->count(),
        };

        if ($lastMonth == 0)
            return 100;
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateRevenue($start, $end)
    {
        return EventParticipant::where('status', 'completed')
            ->whereBetween('payment_date', [$start, $end])
            ->sum('payment_amount');
    }

    private function calculateRevenueTrend()
    {
        $currentRevenue = $this->calculateRevenue(
            now()->startOfMonth(),
            now()
        );

        $lastRevenue = $this->calculateRevenue(
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth()
        );

        if ($lastRevenue == 0)
            return 100;
        return round((($currentRevenue - $lastRevenue) / $lastRevenue) * 100, 1);
    }

    private function getMonthlyRevenue()
    {
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months->push([
                'month' => $date->format('M Y'),
                'amount' => $this->calculateRevenue(
                    $date->startOfMonth(),
                    $date->endOfMonth()
                )
            ]);
        }
        return $months;
    }

    private function getRevenueDistribution()
    {
        return [
            ['name' => 'Événements', 'value' => EventParticipant::where('status', 'completed')->sum('payment_amount')],
            ['name' => 'Formations', 'value' => FormationParticipant::where('status', 'completed')->sum('payment_amount')],
            ['name' => 'Services', 'value' => ServiceRequest::where('status', 'completed')->sum('views')],
        ];
    }

    private function getActivityByType()
    {
        return [
            ['name' => 'Événements', 'value' => Event::where('end_date', '>=', now())->count()],
            ['name' => 'Formations', 'value' => Formation::where('is_published', true)->count()],
            ['name' => 'Services', 'value' => Service::where('status', true)->count()],
            ['name' => 'Articles', 'value' => Post::where('published', true)->count()],
        ];
    }

    private function getTopContent()
    {
        $content = collect();

        // Ajouter les événements
        Event::orderBy('views', 'desc')
            ->limit(3)
            ->get()
            ->each(function ($event) use ($content) {
                $content->push([
                    'title' => $event->title,
                    'type' => 'Événement',
                    'views' => $event->views,
                    'trend' => $this->calculateViewsTrend($event),
                ]);
            });

        // Ajouter les formations
        Formation::orderBy('views', 'desc')
            ->limit(3)
            ->get()
            ->each(function ($training) use ($content) {
                $content->push([
                    'title' => $training->title,
                    'type' => 'Formation',
                    'views' => $training->views,
                    'trend' => $this->calculateViewsTrend($training),
                ]);
            });

        // Ajouter les articles
        Post::orderBy('views', 'desc')
            ->limit(3)
            ->get()
            ->each(function ($post) use ($content) {
                $content->push([
                    'title' => $post->title,
                    'type' => 'Article',
                    'views' => $post->views,
                    'trend' => $this->calculateViewsTrend($post),
                ]);
            });

        $top = $content->sortByDesc('views')->take(5)->values();
        $totalTopViews = (float) $top->sum('views');

        return $top->map(function ($item) use ($totalTopViews) {
            $views = (float) ($item['views'] ?? 0);
            $share = $totalTopViews > 0 ? round(($views / $totalTopViews) * 100, 1) : 0.0;

            $item['share_percent'] = $share;

            return $item;
        })->values();
    }


    private function calculateViewsTrend($model)
    {
        // $viewsLastMonth = $model->view_logs()
        //     ->whereMonth('created_at', now()->subMonth()->month)
        //     ->count();

        // $viewsThisMonth = $model->view_logs()
        //     ->whereMonth('created_at', now()->month)
        //     ->count();

        // if ($viewsLastMonth == 0) return 100;
        // return round((($viewsThisMonth - $viewsLastMonth) / $viewsLastMonth) * 100, 1);
        return 0;
    }

    // Méthode pour les statistiques de paiement
    private function getPaymentStats()
    {
        return [
            'today' => [
                'count' => EventParticipant::whereDate('created_at', today())->count(),
                'amount' => EventParticipant::whereDate('created_at', today())
                    ->where('status', 'completed')
                    ->sum('payment_amount')
            ],
            'this_week' => [
                'count' => EventParticipant::whereBetween('created_at', [now()->startOfWeek(), now()])->count(),
                'amount' => EventParticipant::whereBetween('created_at', [now()->startOfWeek(), now()])
                    ->where('status', 'completed')
                    ->sum('payment_amount')
            ],
            'this_month' => [
                'count' => EventParticipant::whereMonth('created_at', now()->month)->count(),
                'amount' => EventParticipant::whereMonth('created_at', now()->month)
                    ->where('status', 'completed')
                    ->sum('payment_amount')
            ]
        ];
    }

    // Méthode pour obtenir les statistiques des services
    private function getServiceStats()
    {
        return [
            'active' => Service::where('is_active', true)->count(),
            'total_bookings' => ServiceRequest::count(),
            'revenue' => ServiceRequest::where('status', 'completed')->sum('amount'),
            'popular' => Service::withCount('bookings')
                ->orderBy('bookings_count', 'desc')
                ->take(5)
                ->get()
                ->map(function ($service) {
                    return [
                        'name' => $service->name,
                        'bookings' => $service->bookings_count,
                        'revenue' => $service->bookings()->where('status', 'completed')->sum('amount')
                    ];
                })
        ];
    }

    // Méthode pour obtenir les statistiques des formations
    private function getTrainingStats()
    {
        return [
            'active' => Formation::where('is_published', true)->count(),
            'total_participants' => FormationParticipant::count(),
            'revenue' => FormationParticipant::where('status', 'completed')->sum('amount'),
            'popular' => Formation::withCount('participants')
                ->orderBy('participants_count', 'desc')
                ->take(5)
                ->get()
                ->map(function ($training) {
                    return [
                        'name' => $training->title,
                        'participants' => $training->participants_count,
                        'revenue' => $training->participants()->where('status', 'completed')->sum('amount')
                    ];
                })
        ];
    }

    // Méthode pour obtenir les statistiques des blogs
    private function getBlogStats()
    {
        return [
            'published' => Post::where('is_published', true)->count(),
            'total_views' => Post::sum('views'),
            'comments' => 0,
            'popular' => Post::orderBy('views', 'desc')
                ->take(5)
                ->get()
                ->map(function ($post) {
                    return [
                        'title' => $post->title,
                        'views' => $post->views,
                        'comments' => $post->comments()->count(),
                        'trend' => $this->calculateViewsTrend($post)
                    ];
                })
        ];
    }

    // Méthode pour obtenir les utilisateurs récents
    private function getRecentUsers()
    {
        return User::latest()
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'email' => $user->email,
                    'registered' => $user->created_at->diffForHumans(),
                    'participations' => EventParticipant::where('user_id', $user->id)->count()
                ];
            });
    }

    // Méthode pour obtenir les activités récentes
    private function getRecentActivities()
    {
        $activities = collect();

        // Ajouter les inscriptions aux événements
        EventParticipant::with('event')
            ->latest()
            ->take(5)
            ->get()
            ->each(function ($participant) use ($activities) {
                $activities->push([
                    'type' => 'event_registration',
                    'title' => "Inscription à {$participant->event->title}",
                    'user' => $participant->name,
                    'date' => $participant->created_at,
                    'status' => $participant->status
                ]);
            });

        // Ajouter les inscriptions aux formations
        FormationParticipant::with('training')
            ->latest()
            ->take(5)
            ->get()
            ->each(function ($participant) use ($activities) {
                $activities->push([
                    'type' => 'training_registration',
                    'title' => "Inscription à {$participant->training->title}",
                    'user' => $participant->name,
                    'date' => $participant->created_at,
                    'status' => $participant->status
                ]);
            });

        // Ajouter les réservations de services
        ServiceRequest::with('service')
            ->latest()
            ->take(5)
            ->get()
            ->each(function ($booking) use ($activities) {
                $activities->push([
                    'type' => 'service_booking',
                    'title' => "Réservation de {$booking->service->name}",
                    'user' => $booking->name,
                    'date' => $booking->created_at,
                    'status' => $booking->status
                ]);
            });

        return $activities->sortByDesc('date')->take(10)->values();
    }

    public function getStats()
    {
        return response()->json([
            'general' => [
                'total_users' => User::count(),
                'total_events' => Event::count(),
                'total_trainings' => Formation::count(),
                'total_services' => Service::count(),
                'total_posts' => Post::count(),
                'total_revenue' => EventParticipant::where('status', 'completed')->sum('payment_amount') +
                    FormationParticipant::where('status', 'completed')->sum('amount') +
                    ServiceRequest::where('status', 'completed')->sum('amount')
            ],
            'payments' => $this->getPaymentStats(),
            'services' => $this->getServiceStats(),
            'trainings' => $this->getTrainingStats(),
            'blog' => $this->getBlogStats(),
            'recent_users' => $this->getRecentUsers(),
            'recent_activities' => $this->getRecentActivities(),
            'monthly_revenue' => $this->getMonthlyRevenue(),
            'revenue_distribution' => $this->getRevenueDistribution(),
            'activity_by_type' => $this->getActivityByType()
        ]);
    }

    private function getEventFunnel(): array
    {
        $views = Event::sum('views');

        $created = EventParticipant::count();

        $inProgress = EventParticipant::where('status', EventParticipant::STATUS_IN_PROGRESS)->count();

        $completed = EventParticipant::where('status', EventParticipant::STATUS_COMPLETED)->count();

        $cancelled = EventParticipant::where('status', EventParticipant::STATUS_CANCELLED)->count();

        return [
            ['name' => 'Vues événements', 'value' => $views],
            ['name' => 'Inscriptions créées', 'value' => $created],
            ['name' => 'Paiement commencé', 'value' => $inProgress],
            ['name' => 'Paiement terminé', 'value' => $completed],
            ['name' => 'Annulées / expirées', 'value' => $cancelled],
        ];
    }

    private function getEventFunnelCurrent(): array
    {
        $now = now();

        // IDs des événements en cours
        $eventIds = Event::where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->pluck('id');

        $views = Event::whereIn('id', $eventIds)->sum('views');

        $created = EventParticipant::whereIn('event_id', $eventIds)->count();

        $completed = EventParticipant::whereIn('event_id', $eventIds)
            ->where('status', EventParticipant::STATUS_COMPLETED)
            ->count();

        $cancelled = EventParticipant::whereIn('event_id', $eventIds)
            ->where('status', EventParticipant::STATUS_CANCELLED)
            ->count();

        return [
            ['name' => 'Vues', 'value' => $views],
            ['name' => 'Inscriptions', 'value' => $created],
            ['name' => 'Paiements', 'value' => $completed],
            ['name' => 'Annulations', 'value' => $cancelled],
        ];
    }

    private function getEventFunnelUpcoming(): array
    {
        $eventIds = Event::where('start_date', '>', now())->pluck('id');

        return [
            ['name' => 'Vues', 'value' => Event::whereIn('id', $eventIds)->sum('views')],
            ['name' => 'Inscriptions', 'value' => EventParticipant::whereIn('event_id', $eventIds)->count()],
            ['name' => 'Paiements', 'value' => EventParticipant::whereIn('event_id', $eventIds)->where('status', 'completed')->count()],
        ];
    }
}
