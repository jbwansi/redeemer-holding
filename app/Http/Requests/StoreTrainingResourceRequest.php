<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->can('administer') ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'external_url' => ['nullable', 'url'],
            'file' => ['nullable', 'file', 'max:52428800'], // 50MB
            'file_type' => ['required', 'in:pdf,video,image,document,audio,link'],
            'is_downloadable' => ['boolean'],
            'is_public' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.min' => 'Le titre doit contenir au moins 3 caractères.',
            'file.max' => 'Le fichier ne doit pas dépasser 50 Mo.',
            'file_type.in' => 'Le type de fichier n\'est pas valide.',
            'external_url.url' => 'L\'URL externe n\'est pas valide.',
        ];
    }
}
