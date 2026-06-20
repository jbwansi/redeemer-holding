<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Training;
use App\Models\TrainingLesson;
use App\Models\TrainingProgress;
use Illuminate\Database\Seeder;

class TrainingProgressSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $training = Training::first();

        if (!$user || !$training) {
            return;
        }

        $lessons = TrainingLesson::where('training_id', $training->id)
        ->orderBy('sort_order')
        ->get();

        foreach ($lessons as $index => $lesson) {

            if ($index < 2) {

                TrainingProgress::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'training_lesson_id' => $lesson->id,
                    ],
                    [
                        'training_id' => $training->id,
                        'completed' => true,
                        'completed_at' => now(),
                        'watch_time' => 1200,
                    ]
                );

            } elseif ($index === 2) {

                TrainingProgress::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'training_lesson_id' => $lesson->id,
                    ],
                    [
                        'training_id' => $training->id,
                        'completed' => false,
                        'watch_time' => 500,
                    ]
                );
            }
        }
    }
}