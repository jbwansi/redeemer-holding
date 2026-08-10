<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
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
        $serviceId = $this->route('service')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'status' => ['boolean'],
            'cta_primary_url' => ['nullable', 'string', 'max:255'],
            'cta_secondary_url' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'integer'],
            'image' => ['nullable', 'image', 'max:4096'], // Max 4MB
            'tagline' => ['nullable', 'string', 'max:255'],
            'featured_note' => ['nullable', 'string', 'max:255'],
            'cta_primary_label' => ['nullable', 'string', 'max:255'],
            'cta_secondary_label' => ['nullable', 'string', 'max:255'],
            'ideal_for' => ['nullable', 'json'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('services', 'slug')->ignore($serviceId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères',
            'icon.max' => 'L\'icône ne doit pas dépasser 255 caractères',
            'status.boolean' => 'Le format du statut est invalide',
            'slug.max' => 'Le slug ne doit pas dépasser 255 caractères',
            'slug.unique' => 'Le slug est déjà utilisé',
            'image.image' => 'L\'image doit être un fichier image valide',
            'image.max' => 'L\'image ne doit pas dépasser 4MB',
        ];
    }
}
