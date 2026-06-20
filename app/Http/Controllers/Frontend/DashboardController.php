<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Resources\Event\EventCollection;
use App\Http\Resources\Training\TrainingCollection;
use App\Models\Event;
use App\Models\Training;
use App\Models\TrainingParticipant;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{


    public function index()
    {
        $userId = Auth::user()->id;
        $now = now(); // Date actuelle

        // Récupérer les trainings de l'utilisateur
        $trainings = Training::with([
            'participants' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            }
        ])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

        // Récupérer les événements de l'utilisateur
        $events = Event::with([
            'participants' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            }
        ])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();


        // Filtrage des trainings par date
        $countCurrentTrainings = $trainings->filter(fn($formation) => $formation->start_date <= $now && $formation->end_date >= $now)->count();
        $countUpGoingTrainings = $trainings->filter(fn($formation) => $formation->start_date > $now)->count();
        $CountPastTrainings = $trainings->filter(fn($formation) => $formation->end_date < $now)->count();

        // Filtrage des événements par date
        $countCurrentEvents = $events->filter(fn($event) => $event->start_date <= $now && $event->end_date >= $now)->count();
        $countUpGoingEvents = $events->filter(fn($event) => $event->start_date > $now)->count();
        $CountPastEvents = $events->filter(fn($event) => $event->end_date < $now)->count();

        // Résultats à retourner
        $data = [
            'countCurrentTrainings' => $countCurrentTrainings,
            'countUpGoingTrainings' => $countUpGoingTrainings,
            'CountPastTrainings' => $CountPastTrainings,
            'countCurrentEvents' => $countCurrentEvents,
            'countUpGoingEvents' => $countUpGoingEvents,
            'CountPastEvents' => $CountPastEvents,

        ];



        return inertia('Frontend/dashboard/index', $data);
    }

    public function training()
    {
        $userId = Auth::user()->id;

        $trainings = Training::with([
            'participants' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            }
        ])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('status', TrainingParticipant::STATUS_COMPLETED)
                    ->where(function ($participantQuery) {
                        $participantQuery->where('payment_confirmed', true)
                            ->orWhereHas('training', function ($trainingQuery) {
                                $trainingQuery->where('price', '<=', 0);
                            });
                    });
            })
            ->get();
        return inertia('Frontend/dashboard/clientTraining', [
            'trainings' => new TrainingCollection($trainings),
        ]);
    }

    public function trainingAccess($slug)
    {
        $training = Training::published()->where('slug', $slug)->firstOrFail();

        $participantQuery = TrainingParticipant::where('training_id', $training->id)
            ->where('user_id', Auth::id())
            ->where('status', TrainingParticipant::STATUS_COMPLETED);

        if ((float) $training->price > 0) {
            $participantQuery->where('payment_confirmed', true);
        }

        $participant = $participantQuery
            ->latest('created_at')
            ->first();

        if (!$participant) {
            abort(403, 'Accès réservé aux participants ayant finalisé le paiement.');
        }

        return inertia('Frontend/dashboard/clientTrainingAccess', [
            'training' => $training,
            'participant' => $participant,
        ]);
    }

    public function event()
    {
        $userId = Auth::user()->id;
        $events = Event::with([
            "category",
            'participants' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            }
        ])->whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->get();

        return inertia('Frontend/dashboard/clientEvent', ["events" => new EventCollection($events)]);
    }
    public function account()
    {
        return inertia('Frontend/dashboard/clientAccount');
    }
}


