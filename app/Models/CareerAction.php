<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CareerAction extends Model {
    use HasFactory;
    public const STATUSES=['todo','in_progress','completed','cancelled'];
    public const PRIORITIES=['low','medium','high'];
    protected $guarded=[];
    protected $casts=['due_date'=>'date','completed_at'=>'datetime'];
    public function goal(): BelongsTo { return $this->belongsTo(CareerGoal::class,'career_goal_id'); }
}
