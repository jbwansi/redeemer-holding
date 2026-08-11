<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDocument extends Model
{
    use HasFactory;
    public const TYPES = ['cv', 'job_offer', 'job_description', 'certificate', 'other'];
    protected $guarded = [];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
