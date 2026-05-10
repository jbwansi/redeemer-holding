<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
// use App\Mail\EventReminderMail;
use App\Mail\ReminderMail;
use App\Models\EventParticipant;
use App\Models\FormationParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\DynamicMailerService;

class ActivityReminderController extends Controller
{
    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }
    public function send(): JsonResponse
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        $startTime = now();

        Log::info('Démarrage de l\'envoi des rappels d\'activités via API', [
            'date' => now()->format('Y-m-d H:i:s'),
            'target_date' => $tomorrow
        ]);

        try {
            // Rappels pour les événements
            $eventParticipants = EventParticipant::with('event', 'user')
                ->whereHas('event', function ($query) use ($tomorrow) {
                    $query->whereDate('start_date', $tomorrow);
                })
                ->where('status', EventParticipant::STATUS_COMPLETED)
                ->get();

            $eventReminders = 0;
            foreach ($eventParticipants as $participant) {
                try {
                    $this->dynamicMailerService->queue(new ReminderMail('event', $participant), $participant->email);
                    $eventReminders++;
                } catch (\Exception $e) {
                    Log::error('Erreur lors de l\'envoi du rappel d\'événement', [
                        'participant_id' => $participant->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Rappels pour les formations
            $formationParticipants = FormationParticipant::with('formation', 'user')
                ->whereHas('formation', function ($query) use ($tomorrow) {
                    $query->whereDate('start_date', $tomorrow);
                })
                ->where('status', FormationParticipant::STATUS_COMPLETED)
                ->get();

            $formationReminders = 0;
            foreach ($formationParticipants as $participant) {
                try {
                    $this->dynamicMailerService->queue(new ReminderMail('formation', $participant), $participant->email);
                    $formationReminders++;
                } catch (\Exception $e) {
                    Log::error('Erreur lors de l\'envoi du rappel de formation', [
                        'participant_id' => $participant->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $executionTime = now()->diffInSeconds($startTime);

            Log::info('Exécution des rappels API terminée', [
                'total_events' => $eventReminders,
                'total_formations' => $formationReminders,
                'execution_time' => $executionTime
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'event_reminders_sent' => $eventReminders,
                    'formation_reminders_sent' => $formationReminders,
                    'execution_time' => $executionTime
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur critique lors de l\'envoi des rappels via API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de l\'envoi des rappels',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
