<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'status' => ['boolean'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:service_requests,slug,' . $this->service_request],
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
        ];
    }
}
