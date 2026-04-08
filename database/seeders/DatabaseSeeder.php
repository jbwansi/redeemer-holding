<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
            PostSeeder::class,
            EventSeeder::class,
            FormationSeeder::class,
        ]);

        if (app()->environment(['local', 'staging', 'testing'])) {
            $this->call([
                TestUsersSeeder::class,
            ]);
        }
    }
}
