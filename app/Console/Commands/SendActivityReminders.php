<?php

namespace App\Console\Commands;

use App\Mail\EventReminderMail;
use App\Mail\FormationReminderMail;
use App\Models\EventParticipant;
use App\Models\FormationParticipant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendActivityReminders extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Envoyer les rappels pour les formations et événements à venir';

    public function handle()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');

        Log::info('Démarrage de l\'envoi des rappels d\'activités', [
            'date' => now()->format('Y-m-d H:i:s'),
            'target_date' => $tomorrow
        ]);

        try {
            // Rappels pour les événements
            Log::info('Recherche des participants aux événements...');
            $eventParticipants = EventParticipant::with('event', 'user')
                ->whereHas('event', function ($query) use ($tomorrow) {
                    $query->whereDate('start_date', $tomorrow);
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
                        'email' => $participant->email
                    ]);

                    Mail::to($participant->email)
                        ->queue(new EventReminderMail($participant));

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

            // Rappels pour les formations
            Log::info('Recherche des participants aux formations...');

            $formationParticipants = FormationParticipant::with('formation', 'user')
                ->whereHas('formation', function ($query) use ($tomorrow) {
                    $query->whereDate('start_date', $tomorrow);
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
                        'email' => $participant->email
                    ]);

                    Mail::to($participant->email)
                        ->queue(new FormationReminderMail($participant));

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

            // Résumé de l'exécution
            Log::info('Exécution des rappels terminée', [
                'total_events' => $eventParticipants->count(),
                'total_formations' => $formationParticipants->count(),
                'execution_time' => now()->diffInSeconds(now())
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
