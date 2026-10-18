<?php

namespace App\Http\Requests\Blog;

use Illuminate\Foundation\Http\FormRequest;

class StorePostCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $plainText = function ($attribute, $value, $fail) {
            if (is_string($value) && strip_tags($value) !== $value) {
                $fail('Utilisez uniquement du texte brut.');
            }
        };

        return [
            'display_name' => ['required', 'string', 'max:80', $plainText],
            'body' => ['required', 'string', 'max:3000', $plainText],
            'website' => ['nullable', 'string', 'max:0'],
            'comment_form_token' => ['required', 'string', 'max:2048'],
        ];
    }
}
