<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class ServiceRequest extends Model
{
    use Notifiable;

    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'message',
        'service_id',
        'status',
        'code',

        'payment_id',
        'stripe_session_id',
        'payment_amount',
        'payment_date',
        'payment_confirmed',
        'payment_error',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_featured' => ['nullable', 'boolean'],
        'featured_badge' => ['nullable', 'string', 'max:255'],
        'featured_order' => ['nullable', 'integer', 'min:0'],
        'payment_confirmed' => 'boolean',
        'payment_date' => 'datetime',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function routeNotificationForMail()
    {
        return $this->email;
    }

    protected $appends = ["date"];

    public function getDateAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    // Fonction pour générer le code unique
    private function generateUniqueCode()
    {
        do {
            $code = 'SR-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        } while (static::where('code', $code)->exists());

        return $code;
    }

    // Boot function pour intercepter les événements
  protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->code)) {
                $model->code = $model->generateUniqueCode();
            }

            if (empty($model->status)) {
                $model->status = self::STATUS_PENDING;
            }
        });
    }
}
