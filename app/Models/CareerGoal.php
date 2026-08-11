<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class CareerGoal extends Model {
    use HasFactory;
    public const STATUSES = ['draft','active','completed','archived'];
    protected $guarded=[];
    protected $casts=['analysis'=>'array','target_date'=>'date','completed_at'=>'datetime'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function conversation(): BelongsTo { return $this->belongsTo(CoachConversation::class,'coach_conversation_id'); }
    public function actions(): HasMany { return $this->hasMany(CareerAction::class)->orderBy('sort_order'); }
}
