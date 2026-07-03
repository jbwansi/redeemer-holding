<?php

namespace App\Http\Requests;

class UpdateTrainingLessonRequest extends StoreTrainingLessonRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }
}
