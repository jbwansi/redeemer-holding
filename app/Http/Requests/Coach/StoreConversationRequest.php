<?php
namespace App\Http\Requests\Coach;
use App\Coach\Services\CoachSettingsService; use Illuminate\Foundation\Http\FormRequest; use Illuminate\Validation\Rule;
class StoreConversationRequest extends FormRequest { public function authorize(): bool { return auth()->check(); } public function rules(): array { return ['title'=>['required','string','max:255'],'language'=>['required',Rule::in(app(CoachSettingsService::class)->all()['languages'])],'module'=>['nullable','in:general']]; } }
