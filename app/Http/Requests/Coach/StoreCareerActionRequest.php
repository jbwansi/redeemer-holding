<?php
namespace App\Http\Requests\Coach;
use App\Models\CareerAction; use Illuminate\Foundation\Http\FormRequest; use Illuminate\Validation\Rule;
class StoreCareerActionRequest extends FormRequest { public function authorize():bool{return $this->user()!==null;} public function rules():array{return ['title'=>['required','string','max:255'],'description'=>['nullable','string','max:5000'],'priority'=>['required',Rule::in(CareerAction::PRIORITIES)],'due_date'=>['nullable','date']];} }
