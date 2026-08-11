<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCoachSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('administer') === true;
    }

    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'module_interview' => ['required', 'boolean'],
            'module_cv' => ['required', 'boolean'],
            'module_career' => ['required', 'boolean'],
            'module_certification' => ['required', 'boolean'],
            'provider' => ['required', 'in:fake'],
            'languages' => ['required', 'array', 'min:1'],
            'languages.*' => ['required', 'in:fr,de,en'],
            'default_language' => ['required', 'in:fr,de,en'],
            'monthly_message_limit' => ['required', 'integer', 'min:1', 'max:100000'],
            'rate_limit_per_minute' => ['required', 'integer', 'min:1', 'max:1000'],
            'general_instructions' => ['nullable', 'string', 'max:5000'],
            'interview_question_limit' => ['required', 'integer', 'min:3', 'max:10'],
        ];
    }
}
