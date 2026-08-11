<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessionalProfile extends Model
{
    use HasFactory;
    protected $guarded = [];
    protected $casts = ['target_roles' => 'array', 'target_sectors' => 'array', 'languages' => 'array'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
