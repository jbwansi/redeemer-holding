<?php

namespace App\Http\Requests\Coach;

use App\Coach\Services\CoachSettingsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCvAnalysisRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'cv_document_id' => ['required', 'integer'],
            'job_document_id' => ['required', 'integer'],
            'job_title' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'language' => ['required', Rule::in(app(CoachSettingsService::class)->all()['languages'])],
            'submission_token' => ['required', 'uuid'],
        ];
    }
}
