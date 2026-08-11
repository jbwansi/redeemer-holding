<?php
namespace App\Http\Requests\Coach;
use App\Models\UserDocument; use Illuminate\Foundation\Http\FormRequest; use Illuminate\Validation\Rules\File;
class StoreUserDocumentRequest extends FormRequest { public function authorize(): bool { return auth()->check(); } public function rules(): array { return ['type'=>['required','in:'.implode(',',UserDocument::TYPES)],'language'=>['nullable','in:fr,de,en'],'document'=>['required',File::types(['pdf','docx','txt'])->max(10*1024)]]; } }
