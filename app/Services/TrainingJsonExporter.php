<?php

namespace App\Services;

use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingQuiz;
use App\Models\TrainingResource;
use App\Models\TrainingSection;
use Illuminate\Support\Carbon;

class TrainingJsonExporter
{
    public function package(Training $training): array
    {
        $training->load([
            'sections.lessons.resources',
            'sections.quiz.questions',
        ]);

        return [
            'schema_version' => '1.1',
            'type' => 'training',
            'exported_at' => now()->toIso8601String(),
            'data' => [
                'title' => $training->title,
                'slug' => $training->slug,
                'excerpt' => $training->excerpt,
                'content' => $training->content,
                'start_date' => $this->date($training->start_date),
                'end_date' => $this->date($training->end_date),
                'location' => $training->location,
                'featured_image' => $this->jsonValue($training->getRawOriginal('featured_image')),
                'max_participants' => $training->max_participants,
                'price' => $training->price,
                'is_published' => $training->is_published,
                'is_featured' => $training->is_featured,
                'published_at' => $this->date($training->published_at),
                'tags' => $training->tags,
                'meeting_link' => $training->meeting_link,
                'sections' => $training->sections->map(
                    fn (TrainingSection $section) => $this->section($section)
                )->values()->all(),
            ],
        ];
    }

    public function json(Training $training): string
    {
        return json_encode(
            $this->package($training),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        ).PHP_EOL;
    }

    private function section(TrainingSection $section): array
    {
        return [
            'stable_id' => $section->stable_id,
            'title' => $section->title,
            'description' => $section->description,
            'sort_order' => $section->sort_order,
            'is_published' => (bool) $section->is_published,
            'lessons' => $section->lessons->map(
                fn (TrainingLesson $lesson) => $this->lesson($lesson)
            )->values()->all(),
            'quiz' => $section->quiz ? $this->quiz($section->quiz) : null,
        ];
    }

    private function lesson(TrainingLesson $lesson): array
    {
        return [
            'title' => $lesson->title,
            'slug' => $lesson->slug,
            'excerpt' => $lesson->excerpt,
            'content' => $lesson->content,
            'video_url' => $lesson->video_url,
            'video_duration' => $lesson->video_duration,
            'thumbnail' => $this->jsonValue($lesson->getRawOriginal('thumbnail')),
            'sort_order' => $lesson->sort_order,
            'is_free' => $lesson->is_free,
            'is_published' => $lesson->is_published,
            'resources' => $lesson->resources->map(
                fn (TrainingResource $resource) => $this->resource($resource)
            )->values()->all(),
        ];
    }

    private function resource(TrainingResource $resource): array
    {
        return [
            'stable_id' => $resource->stable_id,
            'title' => $resource->title,
            'description' => $resource->description,
            'file_path' => $resource->file_path,
            'external_url' => $resource->external_url,
            'file_disk' => $resource->file_disk,
            'file_type' => $resource->file_type,
            'is_downloadable' => $resource->is_downloadable,
            'is_public' => $resource->is_public,
            'sort_order' => $resource->sort_order,
        ];
    }

    private function quiz(TrainingQuiz $quiz): array
    {
        return [
            'title' => $quiz->title,
            'description' => $quiz->description,
            'passing_score' => $quiz->passing_score,
            'is_published' => $quiz->is_published,
            'questions' => $quiz->questions->map(fn ($question) => [
                'stable_id' => $question->stable_id,
                'question' => $question->question,
                'options' => $question->options,
                'correct_option_index' => $question->correct_option_index,
                'sort_order' => $question->sort_order,
                'points' => $question->points,
            ])->values()->all(),
        ];
    }

    private function date(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->toIso8601String() : null;
    }

    private function jsonValue(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
