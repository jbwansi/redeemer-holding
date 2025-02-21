<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\EventCollection;
use App\Http\Resources\Formation\FormationCollection;
use App\Models\Event;
use App\Models\Formation;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{


    public function index()
    {
        $userId = Auth::user()->id;
        $now = now(); // Date actuelle

        // Récupérer les formations de l'utilisateur
        $formations = Formation::with(['participants' => function ($query) {
            $query->with('user')->orderBy('created_at', 'desc');
        }])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

        // Récupérer les événements de l'utilisateur
        $events = Event::with(['participants' => function ($query) {
            $query->with('user')->orderBy('created_at', 'desc');
        }])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

        // Filtrage des formations par date
        $countCurrentFormations = $formations->filter(fn($formation) => $formation->start_date <= $now && $formation->end_date >= $now)->count();
        $countUpGoingFormations = $formations->filter(fn($formation) => $formation->start_date > $now)->count();
        $CountPastFormations = $formations->filter(fn($formation) => $formation->end_date < $now)->count();

        // Filtrage des événements par date
        $countCurrentEvents = $events->filter(fn($event) => $event->start_date <= $now && $event->end_date >= $now)->count();
        $countUpGoingEvents = $events->filter(fn($event) => $event->start_date > $now)->count();
        $CountPastEvents = $events->filter(fn($event) => $event->end_date < $now)->count();

        // Résultats à retourner
        $data = [
            'countCurrentFormations' => $countCurrentFormations,
            'countUpGoingFormations' => $countUpGoingFormations,
            'CountPastFormations' => $CountPastFormations,
            'countCurrentEvents' => $countCurrentEvents,
            'countUpGoingEvents' => $countUpGoingEvents,
            'CountPastEvents' => $CountPastEvents,
        ];



        return inertia('frontend/dashboard/index', $data);
    }

    public function formation()
    {
        $userId = Auth::user()->id;

        $formations = Formation::with(['participants' => function ($query) {
            $query->with('user')->orderBy('created_at', 'desc');
        }])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();
        return inertia('frontend/dashboard/clientFormation', [
            'formations' => new FormationCollection($formations),
        ]);
    }
    public function event()
    {
        $userId = Auth::user()->id;
        $events = Event::with(["category", 'participants' => function ($query) {
            $query->with('user')->orderBy('created_at', 'desc');
        }])->whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->get();

        return inertia('frontend/dashboard/clientEvent', ["events" => new EventCollection($events)]);
    }
    public function account()
    {
        return inertia('frontend/dashboard/clientAccount');
    }
}
