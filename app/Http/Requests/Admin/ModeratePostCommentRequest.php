<?php

namespace App\Http\Requests\Admin;

use App\Services\Blog\PostCommentModerationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModeratePostCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('administer') && $this->user()->is_active;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(array_keys(PostCommentModerationService::TRANSITIONS))],
            'expected_version' => ['required', 'integer', 'min:0'],
            'reason' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
