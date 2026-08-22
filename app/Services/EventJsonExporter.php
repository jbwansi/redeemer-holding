<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Event;
use Illuminate\Support\Carbon;
use RuntimeException;

class EventJsonExporter
{
    public function package(Event $event): array
    {
        $category = Category::find($event->category_id);

        if (! $category) {
            throw new RuntimeException("La catégorie de l'événement est introuvable.");
        }

        return [
            'schema_version' => '1.0',
            'type' => 'event',
            'exported_at' => now()->toIso8601String(),
            'data' => [
                'title' => $event->title,
                'slug' => $event->slug,
                'description' => $event->description,
                'content' => $event->content,
                'start_date' => $this->date($event->start_date),
                'end_date' => $this->date($event->end_date),
                'location' => $event->location,
                'featured_image' => $this->jsonValue($event->getRawOriginal('featured_image')),
                'category' => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                ],
                'max_participants' => $event->max_participants,
                'price' => $event->price,
                'is_published' => (bool) $event->is_published,
                'is_featured' => (bool) $event->is_featured,
                'published_at' => $this->date($event->published_at),
                'tags' => $event->tags,
            ],
        ];
    }

    public function json(Event $event): string
    {
        return json_encode(
            $this->package($event),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        ).PHP_EOL;
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
