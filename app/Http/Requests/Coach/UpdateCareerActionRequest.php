<?php
namespace App\Http\Requests\Coach;
use App\Models\CareerAction; use Illuminate\Foundation\Http\FormRequest; use Illuminate\Validation\Rule;
class UpdateCareerActionRequest extends FormRequest { public function authorize():bool{return $this->user()!==null;} public function rules():array{return ['title'=>['sometimes','required','string','max:255'],'description'=>['sometimes','nullable','string','max:5000'],'priority'=>['sometimes',Rule::in(CareerAction::PRIORITIES)],'due_date'=>['sometimes','nullable','date'],'status'=>['sometimes',Rule::in(CareerAction::STATUSES)]];} }
