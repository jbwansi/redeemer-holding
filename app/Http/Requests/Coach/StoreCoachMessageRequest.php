<?php
namespace App\Http\Requests\Coach;
use Illuminate\Foundation\Http\FormRequest;
class StoreCoachMessageRequest extends FormRequest { public function authorize(): bool { return auth()->check(); } public function rules(): array { return ['content'=>['required','string','max:8000'],'document_ids'=>['nullable','array','max:10'],'document_ids.*'=>['integer']]; } }
