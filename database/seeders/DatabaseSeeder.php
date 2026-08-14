<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            SettingsSeeder::class,
            CategorySeeder::class,
            ServiceSeeder::class,
        ]);

        // These demonstration seeders require an explicit content owner. Never
        // manufacture an administrator merely to satisfy that relationship.
        if (app()->environment('local') && User::query()->where('role', 'admin')->exists()) {
            $this->call([
                PostSeeder::class,
                EventSeeder::class,
                TrainingSeeder::class,
                TrainingLessonSeeder::class,
                TrainingResourceSeeder::class,
                TrainingProgressSeeder::class,
                TrainingEnrollmentSeeder::class,
            ]);
        }

        // Test accounts are opt-in in local/staging. Automated tests use factories.
        if (app()->environment(['local', 'staging'])) {
            $this->call([
                TestUsersSeeder::class,
            ]);
        }
    }
}
