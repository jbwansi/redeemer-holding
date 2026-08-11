<?php
namespace App\Http\Requests\Coach;
use App\Coach\Services\CoachSettingsService; use Illuminate\Foundation\Http\FormRequest; use Illuminate\Validation\Rule;
class StoreCareerGoalRequest extends FormRequest { public function authorize():bool{return $this->user()!==null;} public function rules():array{return ['title'=>['required','string','max:255'],'current_situation'=>['nullable','string','max:10000'],'target_role'=>['nullable','string','max:255'],'target_sector'=>['nullable','string','max:255'],'target_description'=>['nullable','string','max:10000'],'language'=>['required',Rule::in(app(CoachSettingsService::class)->all()['languages'])],'target_date'=>['nullable','date'],'submission_token'=>['required','uuid']];} }
