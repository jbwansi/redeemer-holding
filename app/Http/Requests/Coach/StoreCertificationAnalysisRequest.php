<?php
namespace App\Http\Requests\Coach;
use App\Coach\Services\CoachSettingsService; use Illuminate\Foundation\Http\FormRequest; use Illuminate\Validation\Rule;
class StoreCertificationAnalysisRequest extends FormRequest { public function authorize():bool{return $this->user()!==null;} public function rules():array{return ['target_role'=>['required','string','max:255'],'target_sector'=>['nullable','string','max:255'],'professional_domain'=>['nullable','string','max:255'],'objective'=>['nullable','string','max:5000'],'language'=>['required',Rule::in(app(CoachSettingsService::class)->all()['languages'])],'career_goal_id'=>['nullable','integer'],'submission_token'=>['required','uuid']];} }
