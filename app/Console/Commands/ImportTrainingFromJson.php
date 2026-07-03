<?php

namespace App\Console\Commands;

use App\Models\Training;
use App\Models\TrainingSection;
use App\Models\TrainingLesson;
use App\Models\TrainingResource;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportTrainingFromJson extends Command
{
    protected $signature = 'training:import {file}';
    protected $description = 'Import a training from a JSON file';

    public function handle()
    {
        $file = $this->argument('file');

        if (!Storage::exists($file)) {
            $this->error("File not found: {$file}");
            return Command::FAILURE;
        }

        $json = Storage::get($file);
        $data = json_decode($json, true);

        if (!$data) {
            $this->error('Invalid JSON file.');
            return Command::FAILURE;
        }

        // Validate required fields
        if (empty($data['title'])) {
            $this->error('Training title is required.');
            return Command::FAILURE;
        }

        try {
            DB::transaction(function () use ($data) {
                $training = Training::updateOrCreate(
                    ['slug' => Str::slug($data['title'])],
                    [
                        'title' => $data['title'],
                        'excerpt' => $data['excerpt'] ?? null,
                        'is_published' => (bool) ($data['is_published'] ?? false),
                    ]
                );

                $sectionIndex = 0;
                foreach ($data['sections'] ?? [] as $sectionData) {
                    if (empty($sectionData['title'])) {
                        $this->warn("Skipping section without title");
                        continue;
                    }

                    $section = TrainingSection::updateOrCreate(
                        [
                            'training_id' => $training->id,
                            'title' => $sectionData['title'],
                        ],
                        [
                            'sort_order' => (int) ($sectionData['sort_order'] ?? ++$sectionIndex),
                        ]
                    );

                    $lessonIndex = 0;
                    foreach ($sectionData['lessons'] ?? [] as $lessonData) {
                        if (empty($lessonData['title'])) {
                            $this->warn("Skipping lesson without title");
                            continue;
                        }

                        $videoDuration = $lessonData['video_duration'] ?? null;
                        if ($videoDuration !== null && (!is_numeric($videoDuration) || $videoDuration < 0)) {
                            $this->warn("Invalid video_duration for lesson {$lessonData['title']}");
                            $videoDuration = null;
                        }

                        $lesson = TrainingLesson::updateOrCreate(
                            [
                                'training_section_id' => $section->id,
                                'title' => $lessonData['title'],
                            ],
                            [
                                'excerpt' => $lessonData['excerpt'] ?? null,
                                'content' => $lessonData['content'] ?? null,
                                'video_url' => $lessonData['video_url'] ?? null,
                                'video_duration' => $videoDuration,
                                'sort_order' => (int) ($lessonData['sort_order'] ?? ++$lessonIndex),
                                'is_published' => (bool) ($lessonData['is_published'] ?? false),
                                'is_free' => (bool) ($lessonData['is_free'] ?? false),
                            ]
                        );

                        $resourceIndex = 0;
                        foreach ($lessonData['resources'] ?? [] as $resourceData) {
                            if (empty($resourceData['title'])) {
                                $this->warn("Skipping resource without title");
                                continue;
                            }

                            TrainingResource::updateOrCreate(
                                [
                                    'training_lesson_id' => $lesson->id,
                                    'title' => $resourceData['title'],
                                ],
                                [
                                    'description' => $resourceData['description'] ?? null,
                                    'external_url' => $resourceData['external_url'] ?? null,
                                    'file_type' => $resourceData['file_type'] ?? 'pdf',
                                    'is_downloadable' => (bool) ($resourceData['is_downloadable'] ?? true),
                                    'is_public' => (bool) ($resourceData['is_public'] ?? false),
                                    'sort_order' => (int) ($resourceData['sort_order'] ?? ++$resourceIndex),
                                ]
                            );
                        }
                    }
                }
            });

            $this->info('✓ Training imported successfully.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Import failed: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}