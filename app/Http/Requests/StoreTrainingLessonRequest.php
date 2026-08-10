<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->can('administer') ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url'],
            'video_duration' => ['nullable', 'integer', 'min:0', 'max:3600'],
            'thumbnail' => ['nullable', 'string', 'url'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'is_free' => ['boolean'],
            'is_published' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre de la leçon est requis.',
            'title.min' => 'Le titre doit contenir au moins 3 caractères.',
            'video_duration.min' => 'La durée de la vidéo ne peut pas être négative.',
            'video_duration.max' => 'La durée de la vidéo ne peut pas dépasser 60 minutes.',
            'video_url.url' => 'L\'URL de la vidéo n\'est pas valide.',
        ];
    }
}
