<?php
namespace App\Coach\Services;
use App\Models\CareerGoal;
class CareerProgressService {
 public function recalculate(CareerGoal $goal): int {
  $total=$goal->actions()->where('status','!=','cancelled')->count();
  $completed=$goal->actions()->where('status','completed')->count();
  $progress=$total===0?0:(int) round($completed/$total*100);
  $goal->update(['progress'=>$progress,'status'=>$total>0&&$completed===$total?'completed':($goal->status==='draft'?'draft':'active'),'completed_at'=>$total>0&&$completed===$total?now():null]);
  return $progress;
 }
}
