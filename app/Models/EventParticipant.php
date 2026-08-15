<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Refund;

class EventParticipant extends Model
{
    use Notifiable;

    protected $fillable = [
        'user_id',
        'event_id',
        'name',
        'qty',
        'email',
        'phone',
        'status',
        'reference',
        'stripe_session_id',
        'payment_id',
        'payment_amount',
        'payment_date',
        'payment_confirmed',
        'payment_error',
        'refund_id',
        'refund_status',
        'refund_amount',
        'refund_date',
        'cancelled_at',
        'cancellation_reason',
        'checked_in_at',
        'checked_in_by',
    ];

    protected $casts = [
        'qty' => 'integer',
        'payment_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'payment_confirmed' => 'boolean',
        'refund_amount' => 'decimal:2',
        'refund_date' => 'datetime',
        'cancelled_at' => 'datetime',
        'checked_in_at' => 'datetime',
    ];

    /**
     * Les statuts possibles pour un participant
     */
    public const STATUS_PENDING = 'pending';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Relation avec l'événement
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Relation avec l'utilisateur (si connecté)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Portée pour obtenir uniquement les inscriptions actives
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_CANCELLED]);
    }

    /**
     * Portée pour obtenir uniquement les inscriptions en attente
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Portée pour obtenir uniquement les inscriptions terminées
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Vérifie si l'inscription est annulée
     */
    public function getIsCancelledAttribute(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Vérifie si l'inscription est en attente
     */
    public function getIsPendingAttribute(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Vérifie si l'inscription est terminée
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Vérifie si l'inscription est en cours de paiement
     */
    public function getIsInProgressAttribute(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Vérifie si l'inscription peut être annulée
     */
    public function getCanBeCancelledAttribute(): bool
    {
        if ($this->status === self::STATUS_CANCELLED) {
            return false;
        }

        // Vérifier si la date limite d'annulation est passée
        $event = $this->event;
        if (! $event) {
            return false;
        }

        $cancellationDeadline = (new \DateTime($event->start_date))->modify('-24 hours');

        return now() <= $cancellationDeadline;
    }

    /**
     * Vérifie si l'inscription est payée
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED && $this->payment_id && $this->payment_confirmed;
    }

    /**
     * Calcul du montant total
     */
    public function getTotalAmountAttribute(): float
    {
        if (! $this->event) {
            return 0;
        }

        $subtotal = $this->event->price * $this->qty;
        $serviceFee = $this->event->price > 0 ? $subtotal * 0.05 : 0;

        return round($subtotal + $serviceFee, 2);
    }

    /**
     * Annuler cette inscription
     */
    public function cancel(): bool
    {
        if (! $this->can_be_cancelled) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        return true;
    }

    /**
     * Marquer cette inscription comme complétée
     */
    public function complete(): bool
    {
        if ($this->status === self::STATUS_COMPLETED) {
            return true;
        }

        $this->update([
            'status' => self::STATUS_COMPLETED,
            'payment_date' => $this->payment_date ?? now(),
            'payment_confirmed' => true,
        ]);

        return true;
    }

    /**
     * Marquer cette inscription comme en cours de paiement
     */
    public function markAsInProgress(string $stripeSessionId): bool
    {
        return $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'stripe_session_id' => $stripeSessionId,
        ]);
    }

    /**
     * Génère le numéro de référence pour le ticket
     */
    public static function generateReference(): string
    {
        return strtoupper(substr(uniqid(), -6).substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ'), 0, 2));
    }

    /**
     * Vérifie si le remboursement est possible
     */
    public function getCanBeRefundedAttribute(): bool
    {
        // Doit être payé et pas déjà annulé
        if (! $this->is_paid || $this->is_cancelled) {
            return false;
        }

        // Vérifier la date limite de remboursement (ex: 7 jours avant l'événement)
        $event = $this->event;
        if (! $event) {
            return false;
        }

        $refundDeadline = (new \DateTime($event->start_date))->modify('-7 days');

        return now() <= $refundDeadline;
    }

    /**
     * Traiter le remboursement d'une inscription
     */
    public function refund($fullRefund = true, $refundAmount = null): bool
    {
        if (! $this->can_be_refunded || ! $this->payment_id) {
            return false;
        }

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // Calculer le montant à rembourser
            $amountToRefund = null;
            if (! $fullRefund && $refundAmount !== null) {
                $amountToRefund = round($refundAmount * 100); // Convertir en centimes
            }

            // Créer le remboursement dans Stripe
            $refund = Refund::create([
                'payment_intent' => $this->payment_id,
                'amount' => $amountToRefund,
                'metadata' => [
                    'participant_id' => $this->id,
                    'event_id' => $this->event_id,
                    'reason' => 'customer_requested',
                ],
            ]);

            // Mettre à jour l'inscription
            $this->update([
                'status' => self::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'refund_id' => $refund->id,
                'refund_amount' => $amountToRefund ? ($amountToRefund / 100) : $this->payment_amount,
                'refund_date' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Erreur lors du remboursement:', [
                'message' => $e->getMessage(),
                'participant_id' => $this->id,
                'payment_id' => $this->payment_id,
            ]);

            return false;
        }
    }

    /**
     * Obtenir la date d'expiration pour finaliser le paiement
     */
    public function getPaymentExpirationAttribute(): ?\DateTime
    {
        if ($this->status !== self::STATUS_PENDING && $this->status !== self::STATUS_IN_PROGRESS) {
            return null;
        }

        if ($this->created_at) {
            return (new \DateTime($this->created_at))->modify('+30 minutes');
        }

        return null;
    }

    /**
     * Vérifie si le paiement a expiré
     */
    public function getIsPaymentExpiredAttribute(): bool
    {
        $expirationDate = $this->payment_expiration;

        return $expirationDate && now() > $expirationDate;
    }

    /**
     * Purger les inscriptions abandonnées et expirées
     */
    public static function purgeExpiredRegistrations(): int
    {
        // Trouver les inscriptions abandonnées ou expirées
        $expiredRegistrations = self::where(function ($query) {
            $query->where('status', self::STATUS_PENDING)
                ->orWhere('status', self::STATUS_IN_PROGRESS);
        })
            ->where('payment_confirmed', false)
            ->whereNull('checked_in_at')
            ->where('created_at', '<', now()->subMinutes(30))
            ->get();

        $count = 0;
        foreach ($expiredRegistrations as $registration) {
            // Annuler la session Stripe si elle existe
            if ($registration->stripe_session_id) {
                try {
                    \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
                    Session::expire($registration->stripe_session_id);
                } catch (\Exception $e) {
                    // Ignorer les erreurs - la session est peut-être déjà expirée
                }
            }

            // Marquer comme annulée
            $registration->update([
                'status' => self::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancellation_reason' => 'expired',
            ]);

            $count++;
        }

        return $count;
    }
}
