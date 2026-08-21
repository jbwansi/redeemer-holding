<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingLesson;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use JsonException;

class LegacyTrainingContentJsonAdapter
{
    public function adapt(string $json, Training $training): array
    {
        try {
            $payload = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw ValidationException::withMessages([
                'file' => 'Le fichier JSON est invalide.',
            ]);
        }

        if (! is_array($payload)) {
            throw ValidationException::withMessages([
                'file' => 'Le fichier JSON doit contenir un objet JSON.',
            ]);
        }

        $validator = Validator::make($payload, [
            'sections' => ['required', 'array', 'min:1'],
            'sections.*' => ['required', 'array'],
            'sections.*.title' => ['required', 'string', 'max:255'],
            'sections.*.description' => ['nullable', 'string'],
            'sections.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'sections.*.is_published' => ['nullable', 'boolean'],
            'sections.*.lessons' => ['nullable', 'array'],
            'sections.*.lessons.*' => ['required', 'array'],
            'sections.*.lessons.*.title' => ['required', 'string', 'max:255'],
            'sections.*.lessons.*.slug' => ['nullable', 'string', 'max:255'],
            'sections.*.lessons.*.excerpt' => ['nullable', 'string', 'max:500'],
            'sections.*.lessons.*.content' => ['nullable', 'string'],
            'sections.*.lessons.*.video_url' => ['nullable', 'url', 'max:2000'],
            'sections.*.lessons.*.video_duration' => ['nullable', 'integer', 'min:0', 'max:3600'],
            'sections.*.lessons.*.thumbnail' => ['nullable'],
            'sections.*.lessons.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'sections.*.lessons.*.is_free' => ['nullable', 'boolean'],
            'sections.*.lessons.*.is_published' => ['nullable', 'boolean'],
            'sections.*.lessons.*.resources' => ['nullable', 'array'],
            'sections.*.lessons.*.resources.*' => ['required', 'array'],
            'sections.*.lessons.*.resources.*.title' => ['required', 'string', 'max:255'],
            'sections.*.lessons.*.resources.*.description' => ['nullable', 'string', 'max:1000'],
            'sections.*.lessons.*.resources.*.external_url' => ['nullable', 'url', 'max:2000'],
            'sections.*.lessons.*.resources.*.file_path' => ['nullable', 'string', 'max:2048'],
            'sections.*.lessons.*.resources.*.file_disk' => ['nullable', 'string', 'in:public,private,local'],
            'sections.*.lessons.*.resources.*.file_type' => ['nullable', 'string', 'in:pdf,video,image,document,audio,link'],
            'sections.*.lessons.*.resources.*.is_downloadable' => ['nullable', 'boolean'],
            'sections.*.lessons.*.resources.*.is_public' => ['nullable', 'boolean'],
            'sections.*.lessons.*.resources.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file' => 'Structure JSON invalide : '.$validator->errors()->first(),
            ]);
        }

        return $this->normalize($validator->validated()['sections'], $training);
    }

    private function normalize(array $sections, Training $training): array
    {
        $nextSectionOrder = ((int) $training->sections()->max('sort_order')) + 1;
        $reservedSlugs = [];

        return collect($sections)->map(function (array $section) use (&$nextSectionOrder, &$reservedSlugs) {
            $nextLessonOrder = 1;
            $sectionData = [
                'title' => $section['title'],
                'description' => $section['description'] ?? null,
                'sort_order' => (int) ($section['sort_order'] ?? $nextSectionOrder),
                'is_published' => (bool) ($section['is_published'] ?? true),
            ];
            $nextSectionOrder++;

            $sectionData['lessons'] = collect($section['lessons'] ?? [])->map(function (array $lesson) use (&$nextLessonOrder, &$reservedSlugs) {
                $slug = Str::slug($lesson['slug'] ?? $lesson['title']);
                if ($slug === '' || isset($reservedSlugs[$slug]) || TrainingLesson::query()->where('slug', $slug)->exists()) {
                    throw ValidationException::withMessages([
                        'file' => "Le slug de leçon « {$slug} » existe déjà ou n’est pas valide.",
                    ]);
                }
                $reservedSlugs[$slug] = true;
                $nextResourceOrder = 1;

                $lessonData = [
                    'title' => $lesson['title'],
                    'slug' => $slug,
                    'excerpt' => $lesson['excerpt'] ?? null,
                    'content' => $lesson['content'] ?? null,
                    'video_url' => $lesson['video_url'] ?? null,
                    'video_duration' => $lesson['video_duration'] ?? null,
                    'thumbnail' => $lesson['thumbnail'] ?? null,
                    'sort_order' => (int) ($lesson['sort_order'] ?? $nextLessonOrder),
                    'is_free' => (bool) ($lesson['is_free'] ?? false),
                    'is_published' => (bool) ($lesson['is_published'] ?? false),
                ];
                $nextLessonOrder++;

                $lessonData['resources'] = collect($lesson['resources'] ?? [])->map(function (array $resource) use (&$nextResourceOrder) {
                    $normalized = [
                        'title' => $resource['title'],
                        'description' => $resource['description'] ?? null,
                        'external_url' => $resource['external_url'] ?? null,
                        'file_path' => $resource['file_path'] ?? null,
                        'file_disk' => $resource['file_disk'] ?? 'public',
                        'file_type' => $resource['file_type'] ?? 'pdf',
                        'is_downloadable' => (bool) ($resource['is_downloadable'] ?? true),
                        'is_public' => (bool) ($resource['is_public'] ?? false),
                        'sort_order' => (int) ($resource['sort_order'] ?? $nextResourceOrder),
                    ];
                    $nextResourceOrder++;

                    return $normalized;
                })->all();

                return $lessonData;
            })->all();

            return $sectionData;
        })->all();
    }
}
