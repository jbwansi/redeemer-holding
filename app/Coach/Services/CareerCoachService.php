<?php
namespace App\Coach\Services;
use App\Coach\Prompts\PromptRegistry;
use App\Models\CareerGoal; use App\Models\User;
use Illuminate\Support\Facades\DB; use RuntimeException; use Throwable;
class CareerCoachService {
 public function __construct(private DigitalCoachService $coach,private CoachContextService $contexts,private CoachSettingsService $settings,private PromptRegistry $prompts,private CareerProgressService $progress){}
 public function create(User $user,array $data): CareerGoal {
  abort_unless($this->settings->moduleEnabled('career'),403,'Le module Orientation & carrière est désactivé.');
  if($existing=$user->careerGoals()->where('submission_token',$data['submission_token'])->first()) return $existing;
  $conversation=$user->coachConversations()->create(['module'=>'career','title'=>'Carrière — '.$data['title'],'language'=>$data['language'],'status'=>'active']);
  $goal=$user->careerGoals()->create([...$data,'coach_conversation_id'=>$conversation->id,'status'=>'draft','progress'=>0]);
  try {
   $context=$this->factsContext($user,$goal);
   $situation=$this->operation($user,$goal,'career.analyze_situation',$context,['current_position_summary'=>'string','strengths'=>'array','transferable_skills'=>'array','gaps'=>'array','opportunities'=>'array','risks_or_constraints'=>'array']);
   $this->strings($situation,['strengths','transferable_skills','gaps','opportunities','risks_or_constraints']);
   $gaps=$this->operation($user,$goal,'career.gap_analysis',$context+['situation_suggestions'=>$situation],['target'=>'string','existing_strengths'=>'array','missing_skills'=>'array','experience_gaps'=>'array','knowledge_gaps'=>'array','priority_gaps'=>'array']);
   $this->strings($gaps,['existing_strengths','missing_skills','experience_gaps','knowledge_gaps','priority_gaps']);
   $roles=$this->operation($user,$goal,'career.explore_roles',$context+['gap_suggestions'=>$gaps],['recommended_roles'=>'array']);
   foreach($roles['recommended_roles'] as $role) abort_unless(is_array($role)&&isset($role['title'],$role['why_it_fits'],$role['strengths_used'],$role['gaps_to_close'])&&is_string($role['title'])&&is_string($role['why_it_fits'])&&is_array($role['strengths_used'])&&is_array($role['gaps_to_close']),422);
   $plan=$this->operation($user,$goal,'career.build_action_plan',$context+['gap_suggestions'=>$gaps],['actions'=>'array']);
   DB::transaction(function()use($goal,$situation,$gaps,$roles,$plan){
    foreach($plan['actions'] as $i=>$action){ abort_unless(is_array($action)&&isset($action['title'],$action['description'],$action['priority'],$action['suggested_due_window'])&&is_string($action['title'])&&in_array($action['priority'],['low','medium','high'],true),422); $goal->actions()->create(['title'=>$action['title'],'description'=>$action['description'].' ('.$action['suggested_due_window'].')','priority'=>$action['priority'],'status'=>'todo','progress'=>0,'sort_order'=>$i+1,'source'=>'proposed']); }
    $goal->update(['analysis'=>compact('situation','gaps','roles'),'status'=>'active']);
   });
   $this->progress->recalculate($goal); return $goal->fresh('actions');
  } catch(Throwable $e){ if($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) throw $e; throw new RuntimeException('L’analyse carrière est temporairement indisponible.',0,$e); }
 }
 public function factsContext(User $user,CareerGoal $goal):array { return $this->contexts->build($user,$goal->conversation,'')+['career_goal_facts'=>$goal->only(['title','current_situation','target_role','target_sector','target_description','target_date']),'context_semantics'=>['facts'=>'Only profile and career_goal_facts are FACT.','suggestions'=>'Generated strengths, skills, roles, gaps and actions are SUGGESTION and never update ProfessionalProfile.']]; }
 private function operation(User $user,CareerGoal $goal,string $key,array $context,array $schema):array{return $this->coach->generateStructuredOperation($user,$goal->conversation,$this->prompts->forKey($key),$context,$schema,$key)->data;}
 private function strings(array $data,array $keys):void{foreach($keys as $key)if(collect($data[$key])->contains(fn($v)=>!is_string($v)))throw new RuntimeException('Invalid structured response');}
}
