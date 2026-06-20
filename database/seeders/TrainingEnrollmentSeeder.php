<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Training;
use App\Models\TrainingParticipant;
use Illuminate\Database\Seeder;

class TrainingEnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $training = Training::first();

        if (!$user || !$training) {
            return;
        }

        TrainingParticipant::updateOrCreate(
            [
                'training_id' => $training->id,
                'user_id' => $user->id,
            ],
            [
                'name' => $user->name,
                'email' => $user->email,
                'reference' => 'TEST-' . $training->id,
                'status' => 'completed',
                'qty' => 1,
                'payment_amount' => $training->price ?? 0,
                'payment_date' => now(),
            ]
        );
    }
}