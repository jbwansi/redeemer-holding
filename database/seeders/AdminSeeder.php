<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Administrators must be created explicitly with `php artisan admin:create`.
        // Keeping this seeder inert makes `db:seed` safe in every environment.
    }
}
