<?php

namespace App\Services;

use App\Models\TrainingParticipant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TrainingRegistrationLinkService
{
    private const SESSION_KEY = 'training_registration_link';
    private const INTENT_LIFETIME_MINUTES = 60;

    public function remember(TrainingParticipant $participant): void
    {
        session()->put(self::SESSION_KEY, [
            'participant_id' => $participant->id,
            'training_id' => $participant->training_id,
            'expires_at' => now()->addMinutes(self::INTENT_LIFETIME_MINUTES)->timestamp,
        ]);
    }

    public function hasPending(): bool
    {
        return $this->validIntent() !== null;
    }

    public function pendingEmail(): ?string
    {
        $intent = $this->validIntent();

        if (!is_array($intent) || empty($intent['participant_id'])) {
            return null;
        }

        return TrainingParticipant::query()->whereKey($intent['participant_id'])->value('email');
    }

    public function claim(User $user): ?TrainingParticipant
    {
        $intent = $this->validIntent();

        if (!is_array($intent) || empty($intent['participant_id']) || empty($intent['training_id'])) {
            return null;
        }

        if (!$user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => 'Votre adresse e-mail doit être vérifiée avant de rattacher cette inscription.',
            ]);
        }

        $participant = DB::transaction(function () use ($intent, $user) {
            $participant = TrainingParticipant::query()->lockForUpdate()->findOrFail($intent['participant_id']);

            if ((int) $participant->training_id !== (int) $intent['training_id']) {
                abort(403);
            }

            if ($participant->status === TrainingParticipant::STATUS_CANCELLED) {
                throw ValidationException::withMessages([
                    'registration' => 'Cette inscription a été annulée et ne peut pas être rattachée.',
                ]);
            }

            if ($participant->user_id !== null) {
                abort_unless((int) $participant->user_id === (int) $user->id, 403);

                return $participant;
            }

            if ($this->normalizeEmail($participant->email) !== $this->normalizeEmail($user->email)) {
                throw ValidationException::withMessages([
                    'email' => "L'adresse e-mail du compte ne correspond pas à celle de l'inscription.",
                ]);
            }

            $duplicateExists = TrainingParticipant::query()
                ->where('training_id', $participant->training_id)
                ->where('user_id', $user->id)
                ->where('id', '!=', $participant->id)
                ->where('status', '!=', TrainingParticipant::STATUS_CANCELLED)
                ->exists();

            if ($duplicateExists) {
                throw ValidationException::withMessages([
                    'email' => 'Ce compte possède déjà une inscription active à cette formation.',
                ]);
            }

            $participant->update(['user_id' => $user->id]);

            return $participant->fresh('training');
        });

        session()->forget([self::SESSION_KEY, 'temp_participant_' . $participant->id]);

        return $participant;
    }

    private function normalizeEmail(?string $email): string
    {
        return mb_strtolower(trim((string) $email));
    }

    private function validIntent(): ?array
    {
        $intent = session()->get(self::SESSION_KEY);

        if (
            !is_array($intent)
            || empty($intent['participant_id'])
            || empty($intent['training_id'])
            || empty($intent['expires_at'])
            || (int) $intent['expires_at'] < now()->timestamp
        ) {
            session()->forget(self::SESSION_KEY);

            return null;
        }

        return $intent;
    }
}
