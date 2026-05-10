<?php

namespace App\Console\Commands;

// use App\Mail\EventReminderMail;
// use App\Mail\FormationReminderMail;
use App\Models\EventParticipant;
use App\Models\FormationParticipant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Mail;
use App\Services\DynamicMailerService;
use App\Mail\ReminderMail;

class SendActivityReminders extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Envoyer les rappels pour les formations et événements à venir';

    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        parent::__construct();
        $this->dynamicMailerService = $dynamicMailerService;
    }

    public function handle()
    {
        $globalEnabled = (bool) get_setting('registration_reminders_enabled', true);

        if (!$globalEnabled) {
            $this->info('Les rappels sont désactivés dans les paramètres.');
            return self::SUCCESS;
        }

        $daysBefore = max(1, (int) get_setting('reminder_days_before', 1));
        $targetDate = now()->addDays($daysBefore)->format('Y-m-d');
        $eventRemindersEnabled = (bool) get_setting('event_reminder_enabled', true);
        $formationRemindersEnabled = (bool) get_setting('formation_reminder_enabled', true);
        $eventZoomLink = get_setting('event_reminder_zoom_link');
        $formationZoomLink = get_setting('formation_reminder_zoom_link');

        Log::info('Démarrage de l\'envoi des rappels d\'activités', [
            'date' => now()->format('Y-m-d H:i:s'),
            'target_date' => $targetDate,
            'days_before' => $daysBefore,
            'event_enabled' => $eventRemindersEnabled,
            'formation_enabled' => $formationRemindersEnabled,
        ]);

        try {
            $eventParticipants = collect();
            $formationParticipants = collect();

            // Rappels pour les événements
            if ($eventRemindersEnabled) {
                Log::info('Recherche des participants aux événements...');
                $eventParticipants = EventParticipant::with('event', 'user')
                    ->whereHas('event', function ($query) use ($targetDate) {
                        $query->whereDate('start_date', $targetDate);
                    })
                    ->where('status', EventParticipant::STATUS_COMPLETED)
                    ->get();

                Log::info('Participants aux événements trouvés', [
                    'count' => $eventParticipants->count()
                ]);

                foreach ($eventParticipants as $participant) {
                    try {
                        Log::info('Envoi du rappel d\'événement', [
                            'participant_id' => $participant->id,
                            'event_id' => $participant->event_id,
                            'email' => $participant->email,
                            'days_before' => $daysBefore,
                        ]);

                        $this->dynamicMailerService->queue(new ReminderMail('event', $participant, $daysBefore, $eventZoomLink), $participant->email);

                        Log::info('Rappel d\'événement envoyé avec succès', [
                            'participant_id' => $participant->id
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Erreur lors de l\'envoi du rappel d\'événement', [
                            'participant_id' => $participant->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
            } else {
                Log::info('Rappels événements désactivés par configuration.');
            }

            // Rappels pour les formations
            if ($formationRemindersEnabled) {
                Log::info('Recherche des participants aux formations...');

                $formationParticipants = FormationParticipant::with('formation', 'user')
                    ->whereHas('formation', function ($query) use ($targetDate) {
                        $query->whereDate('start_date', $targetDate);
                    })
                    ->where('status', FormationParticipant::STATUS_COMPLETED)
                    ->get();

                Log::info('Participants aux formations trouvés', [
                    'count' => $formationParticipants->count()
                ]);

                foreach ($formationParticipants as $participant) {
                    try {
                        Log::info('Envoi du rappel de formation', [
                            'participant_id' => $participant->id,
                            'formation_id' => $participant->formation_id,
                            'email' => $participant->email,
                            'days_before' => $daysBefore,
                        ]);

                        $this->dynamicMailerService->queue(new ReminderMail('formation', $participant, $daysBefore, $formationZoomLink), $participant->email);

                        Log::info('Rappel de formation envoyé avec succès', [
                            'participant_id' => $participant->id
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Erreur lors de l\'envoi du rappel de formation', [
                            'participant_id' => $participant->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
            } else {
                Log::info('Rappels formations désactivés par configuration.');
            }

            // Résumé de l'exécution
            Log::info('Exécution des rappels terminée', [
                'total_events' => $eventParticipants->count(),
                'total_formations' => $formationParticipants->count(),
                'days_before' => $daysBefore,
            ]);

            $this->info('Rappels envoyés avec succès!');
            $this->table(
                ['Type', 'Nombre de rappels envoyés'],
                [
                    ['Événements', $eventParticipants->count()],
                    ['Formations', $formationParticipants->count()]
                ]
            );
        } catch (\Exception $e) {
            Log::error('Erreur critique lors de l\'envoi des rappels', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->error('Une erreur est survenue lors de l\'envoi des rappels.');
            throw $e;
        }
    }
}
