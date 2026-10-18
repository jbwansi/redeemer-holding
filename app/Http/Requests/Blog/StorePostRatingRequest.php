<?php

namespace App\Http\Requests\Blog;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['rating' => ['required', 'integer', 'between:1,5', function ($attribute, $value, $fail) {
            if (! is_int($value) && ! (is_string($value) && preg_match('/^[1-5]$/D', $value))) {
                $fail('La note doit être un entier de 1 à 5.');
            }
        }]];
    }
}
