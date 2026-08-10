<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()?->can('administer') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'image', 'max:2048'],
            'category_ids' => ['array'],
            'category_ids.*' => ['exists:categories,id'],
            'published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:posts,slug,' . $this->post],
            'tags' => ['array', 'nullable'],
        ];
    }


    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est obligatoire',
            'title.max' => 'Le titre ne doit pas dépasser 255 caractères',
            'featured_image.image' => 'Le fichier doit être une image',
            'featured_image.max' => 'L\'image ne doit pas dépasser 2Mo',
            'category_ids.array' => 'Le format des catégories est invalide',
            'category_ids.*.exists' => 'Une des catégories sélectionnées n\'existe pas',
            'published.boolean' => 'Le format de la publication est invalide',
            'published_at.date' => 'Le format de la date de publication est invalide',
            'slug.max' => 'Le slug ne doit pas dépasser 255 caractères',
            'slug.unique' => 'Le slug est déjà utilisé',
        ];
    }
}
