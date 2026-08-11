<?php

namespace App\Http\Requests\Coach;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewAnswerRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }
    public function rules(): array { return ['answer' => ['required', 'string', 'max:10000'], 'submission_token' => ['required', 'uuid']]; }
}
