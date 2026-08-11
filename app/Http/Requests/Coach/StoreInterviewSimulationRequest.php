<?php

namespace App\Http\Requests\Coach;

use App\Coach\Services\CoachSettingsService;
use App\Models\InterviewSimulation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInterviewSimulationRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }
    public function rules(): array
    {
        return [
            'job_title' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'job_description' => ['nullable', 'string', 'max:10000'],
            'interview_type' => ['required', Rule::in(InterviewSimulation::TYPES)],
            'difficulty' => ['required', Rule::in(InterviewSimulation::DIFFICULTIES)],
            'language' => ['required', Rule::in(app(CoachSettingsService::class)->all()['languages'])],
            'document_ids' => ['nullable', 'array', 'max:2'],
            'document_ids.*' => ['integer'],
        ];
    }
}
