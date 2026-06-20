<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventParticipant;
use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TestDashboardActivitiesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'test@test.com')->first();

        if (!$user) {
            $this->command?->warn('User test@test.com not found.');

            return;
        }

        $admin = User::where('role', 'admin')->first() ?? User::firstOrFail();
        $category = EventCategory::firstOrCreate(
            ['slug' => 'dashboard-test'],
            [
                'name' => 'Dashboard Test',
                'color' => '#DA2E29',
                'description' => 'Test data for the client dashboard.',
            ]
        );

        $trainingImage = [
            'thumbnail' => 'trainings/69d43acc4c4fc_1775516364.jpg',
            'medium' => 'trainings/69d43acc4c4fc_1775516364.jpg',
            'large' => 'trainings/69d43acc4c4fc_1775516364.jpg',
            'original' => 'trainings/69d43acc4c4fc_1775516364.jpg',
            'banner' => 'trainings/69d43acc4c4fc_1775516364.jpg',
        ];

        $eventImage = [
            'thumbnail' => 'events/69d440761ebec_1775517814.jpg',
            'medium' => 'events/69d440761ebec_1775517814.jpg',
            'large' => 'events/69d440761ebec_1775517814.jpg',
            'original' => 'events/69d440761ebec_1775517814.jpg',
            'banner' => 'events/69d440761ebec_1775517814.jpg',
        ];

        $trainings = [
            [
                'slug' => 'dashboard-test-training-current',
                'title' => 'Dashboard Test Training Current',
                'excerpt' => 'Current training assigned to test@test.com for dashboard verification.',
                'content' => '<p>Current training used to verify the client dashboard.</p>',
                'location' => 'Montreal - Online',
                'start_date' => now()->subDays(2)->setTime(9, 0),
                'end_date' => now()->addDays(5)->setTime(17, 0),
                'price' => 0,
                'status' => TrainingParticipant::STATUS_IN_PROGRESS,
            ],
            [
                'slug' => 'dashboard-test-training-upcoming',
                'title' => 'Dashboard Test Training Upcoming',
                'excerpt' => 'Upcoming training assigned to test@test.com for dashboard verification.',
                'content' => '<p>Upcoming training used to verify the client dashboard.</p>',
                'location' => 'Montreal - Hybrid',
                'start_date' => now()->addDays(10)->setTime(9, 0),
                'end_date' => now()->addDays(12)->setTime(17, 0),
                'price' => 120,
                'status' => TrainingParticipant::STATUS_PENDING,
            ],
            [
                'slug' => 'dashboard-test-training-past',
                'title' => 'Dashboard Test Training Past',
                'excerpt' => 'Past training assigned to test@test.com for dashboard verification.',
                'content' => '<p>Past training used to verify the client dashboard.</p>',
                'location' => 'Montreal - Classroom',
                'start_date' => now()->subDays(20)->setTime(9, 0),
                'end_date' => now()->subDays(18)->setTime(17, 0),
                'price' => 90,
                'status' => TrainingParticipant::STATUS_COMPLETED,
            ],
        ];

        foreach ($trainings as $data) {
            $training = Training::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'excerpt' => $data['excerpt'],
                    'content' => $data['content'],
                    'location' => $data['location'],
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'price' => $data['price'],
                    'max_participants' => 20,
                    'featured_image' => $trainingImage,
                    'is_featured' => false,
                    'is_published' => true,
                    'published_at' => now(),
                    'tags' => ['dashboard', 'test'],
                    'meeting_link' => 'https://zoom.us/j/' . Str::slug($data['slug']),
                    'user_id' => $admin->id,
                ]
            );

            TrainingParticipant::updateOrCreate(
                [
                    'training_id' => $training->id,
                    'user_id' => $user->id,
                ],
                [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'reference' => 'DASH-' . strtoupper(Str::random(8)),
                    'status' => $data['status'],
                    'qty' => 1,
                    'payment_amount' => $data['price'],
                    'payment_confirmed' => $data['status'] !== TrainingParticipant::STATUS_PENDING,
                    'payment_date' => $data['status'] === TrainingParticipant::STATUS_PENDING ? null : now()->subDay(),
                    'payment_id' => $data['status'] === TrainingParticipant::STATUS_PENDING ? null : 'PAY-' . strtoupper(Str::random(10)),
                ]
            );
        }

        $events = [
            [
                'slug' => 'dashboard-test-event-current',
                'title' => 'Dashboard Test Event Current',
                'description' => 'Current event assigned to test@test.com for dashboard verification.',
                'content' => '<p>Current event used to verify the client dashboard.</p>',
                'location' => 'Montreal - Main Hall',
                'start_date' => now()->subHours(4),
                'end_date' => now()->addHours(4),
                'price' => 0,
                'status' => EventParticipant::STATUS_IN_PROGRESS,
            ],
            [
                'slug' => 'dashboard-test-event-upcoming',
                'title' => 'Dashboard Test Event Upcoming',
                'description' => 'Upcoming event assigned to test@test.com for dashboard verification.',
                'content' => '<p>Upcoming event used to verify the client dashboard.</p>',
                'location' => 'Montreal - Studio',
                'start_date' => now()->addDays(7)->setTime(18, 0),
                'end_date' => now()->addDays(7)->setTime(20, 0),
                'price' => 35,
                'status' => EventParticipant::STATUS_PENDING,
            ],
            [
                'slug' => 'dashboard-test-event-past',
                'title' => 'Dashboard Test Event Past',
                'description' => 'Past event assigned to test@test.com for dashboard verification.',
                'content' => '<p>Past event used to verify the client dashboard.</p>',
                'location' => 'Montreal - Conference Room',
                'start_date' => now()->subDays(14)->setTime(18, 0),
                'end_date' => now()->subDays(14)->setTime(20, 0),
                'price' => 20,
                'status' => EventParticipant::STATUS_COMPLETED,
            ],
        ];

        foreach ($events as $data) {
            $event = Event::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'category_id' => $category->id,
                    'user_id' => $admin->id,
                    'description' => $data['description'],
                    'content' => $data['content'],
                    'location' => $data['location'],
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'price' => $data['price'],
                    'max_participants' => 30,
                    'featured_image' => $eventImage,
                    'is_featured' => false,
                    'is_published' => true,
                    'published_at' => now(),
                    'tags' => ['dashboard', 'test'],
                ]
            );

            EventParticipant::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ],
                [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'qty' => 1,
                    'status' => $data['status'],
                ]
            );
        }
    }
}