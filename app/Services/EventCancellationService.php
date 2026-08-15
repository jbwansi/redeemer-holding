<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Services\Payments\StripeRefundService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventCancellationService
{
    public function cancel(
        Event $event,
        EventParticipant $participant,
        bool $bypassDeadline = false
    ): EventParticipant {
        return DB::transaction(function () use ($event, $participant, $bypassDeadline) {
            $lockedParticipant = EventParticipant::with('event')
                ->lockForUpdate()
                ->findOrFail($participant->id);

            abort_unless((int) $lockedParticipant->event_id === (int) $event->id, 404);

            if ($lockedParticipant->status === EventParticipant::STATUS_CANCELLED) {
                return $lockedParticipant;
            }

            if (! $bypassDeadline && now()->isAfter($event->start_date->copy()->subDay())) {
                throw ValidationException::withMessages([
                    'general' => 'Les annulations ne sont plus possibles moins de 24 h avant le début de l’événement.',
                ]);
            }

            $hasConfirmedPayment = (float) $event->price > 0
                && $lockedParticipant->payment_confirmed;

            if ($hasConfirmedPayment) {
                $this->refund($lockedParticipant);
            }

            $lockedParticipant->update([
                'status' => EventParticipant::STATUS_CANCELLED,
                'cancelled_at' => $lockedParticipant->cancelled_at ?? now(),
                'cancellation_reason' => $bypassDeadline
                    ? 'admin_requested'
                    : 'customer_requested',
            ]);

            return $lockedParticipant->refresh();
        });
    }

    private function refund(EventParticipant $participant): void
    {
        if ($participant->refund_id) {
            return;
        }

        if (! $participant->payment_id || $participant->payment_amount === null) {
            throw ValidationException::withMessages([
                'general' => 'Le paiement ne contient pas les informations nécessaires à un remboursement automatique.',
            ]);
        }

        $refund = app(StripeRefundService::class)->createFullRefund(
            $participant->payment_id,
            [
                'payment_type' => 'event',
                'participant_id' => $participant->id,
                'event_id' => $participant->event_id,
                'reason' => 'customer_requested',
            ],
            'event-refund-'.$participant->id.'-'.$participant->payment_id
        );

        $status = (string) ($refund->status ?? 'pending');

        if (in_array($status, ['failed', 'canceled'], true)) {
            throw ValidationException::withMessages([
                'general' => 'Le remboursement Stripe a été refusé. L’inscription reste confirmée.',
            ]);
        }

        $participant->update([
            'refund_id' => $refund->id,
            'refund_status' => $status,
            'refund_amount' => isset($refund->amount)
                ? ((int) $refund->amount) / 100
                : $participant->payment_amount,
            'refund_date' => now(),
        ]);
    }
}
