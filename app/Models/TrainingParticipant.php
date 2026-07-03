<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Refund;

class TrainingParticipant extends Model
{
    use Notifiable;

    protected $table = 'training_participants';

    protected $fillable = [
        'user_id',
        'training_id',
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
        'cancelled_at'
    ];

    protected $casts = [
        'qty' => 'integer',
        'payment_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'payment_confirmed' => 'boolean',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Les statuts possibles pour un participant
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REGISTERED = 'registered';
    public const STATUS_CONFIRMED = 'confirmed';

    /**
     * Relation avec la formation
     */
    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'training_id');
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
        $training = $this->training;
        if (!$training) {
            return false;
        }

        $cancellationDeadline = (new \DateTime($training->start_date))->modify('-24 hours');
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
        if (!$this->training) {
            return 0;
        }

        $subtotal = $this->training->price * $this->qty;
        $serviceFee = $this->training->price > 0 ? $subtotal * 0.05 : 0;

        return round($subtotal + $serviceFee, 2);
    }

    /**
     * Annuler cette inscription
     */
    public function cancel(): bool
    {
        if (!$this->can_be_cancelled) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now()
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
            'payment_confirmed' => true
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
            'stripe_session_id' => $stripeSessionId
        ]);
    }

    /**
     * Génère le numéro de référence pour l'inscription
     */
    public static function generateReference(): string
    {
        return 'FORM-' . strtoupper(substr(uniqid(), -6) . substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ'), 0, 2));
    }

    /**
     * Vérifie si le remboursement est possible
     */
    public function getCanBeRefundedAttribute(): bool
    {
        // Doit être payé et pas déjà annulé
        if (!$this->is_paid || $this->is_cancelled) {
            return false;
        }

        // Vérifier la date limite de remboursement (ex: 7 jours avant la formation)
        $training = $this->training;
        if (!$training) {
            return false;
        }

        $refundDeadline = (new \DateTime($training->start_date))->modify('-7 days');
        return now() <= $refundDeadline;
    }

    /**
     * Traiter le remboursement d'une inscription
     */
    public function refund($fullRefund = true, $refundAmount = null): bool
    {
        if (!$this->can_be_refunded || !$this->payment_id) {
            return false;
        }

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            $amountToRefund = null;
            if (!$fullRefund && $refundAmount !== null) {
                $amountToRefund = round($refundAmount * 100); // Convertir en centimes
            }

            $refund = Refund::create([
                'payment_intent' => $this->payment_id,
                'amount' => $amountToRefund,
                'metadata' => [
                    'participant_id' => $this->id,
                    'training_id' => $this->training_id,
                    'reason' => 'customer_requested'
                ]
            ]);

            $this->update([
                'status' => self::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'refund_id' => $refund->id,
                'refund_amount' => $amountToRefund ? ($amountToRefund / 100) : $this->payment_amount,
                'refund_date' => now()
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Erreur lors du remboursement de la formation:', [
                'message' => $e->getMessage(),
                'participant_id' => $this->id,
                'payment_id' => $this->payment_id
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
        $expiredRegistrations = self::whereIn('status', [self::STATUS_PENDING, self::STATUS_IN_PROGRESS])
            ->where('created_at', '<', now()->subMinutes(30))
            ->get();

        $count = 0;
        foreach ($expiredRegistrations as $registration) {
            if ($registration->stripe_session_id) {
                try {
                    \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
                    Session::expire($registration->stripe_session_id);
                } catch (\Exception $e) {
                    // Ignorer les erreurs - la session est peut-être déjà expirée
                }
            }

            $registration->update([
                'status' => self::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancellation_reason' => 'expired'
            ]);

            $count++;
        }

        return $count;
    }
}
