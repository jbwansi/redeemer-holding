<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class ServiceRequest extends Model
{
    use Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'message',
        'service_id',
        'status',
        'code'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

        // Avant la création du modèle
        static::creating(function ($model) {
            if (empty($model->code)) {
                $model->code = $model->generateUniqueCode();
            }
        });
    }
}
