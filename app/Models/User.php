<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'bio',
        'profile_photo_path',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function getProfilePhotoPathAttribute()
    {
        return 'https://www.gravatar.com/avatar/' . md5(strtolower($this->email)) . '?d=mp';
    }

    public function professionalProfile(): HasOne { return $this->hasOne(ProfessionalProfile::class); }
    public function coachDocuments(): HasMany { return $this->hasMany(UserDocument::class); }
    public function coachConversations(): HasMany { return $this->hasMany(CoachConversation::class); }
    public function interviewSimulations(): HasMany { return $this->hasMany(InterviewSimulation::class); }
    public function coachAnalyses(): HasMany { return $this->hasMany(CoachAnalysis::class); }
    public function careerGoals(): HasMany { return $this->hasMany(CareerGoal::class); }
    public function coachUsages(): HasMany { return $this->hasMany(CoachUsage::class); }
}
