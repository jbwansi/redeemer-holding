<?php
namespace App\Http\Requests\Coach;
use Illuminate\Foundation\Http\FormRequest;
class UpdateProfessionalProfileRequest extends FormRequest { public function authorize(): bool { return auth()->check(); } public function rules(): array { return ['professional_title'=>['nullable','string','max:255'],'summary'=>['nullable','string','max:5000'],'career_objective'=>['nullable','string','max:5000'],'default_language'=>['required','in:fr,de,en'],'target_roles'=>['nullable','array','max:20'],'target_roles.*'=>['string','max:100'],'target_sectors'=>['nullable','array','max:20'],'target_sectors.*'=>['string','max:100'],'languages'=>['nullable','array','max:20'],'languages.*'=>['string','max:100']]; } }
