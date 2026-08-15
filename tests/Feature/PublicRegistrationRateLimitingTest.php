<?php

namespace Tests\Feature;

use App\Http\Middleware\OnlyTestUsers;
use App\Models\Event;
use App\Models\Training;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PublicRegistrationRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(OnlyTestUsers::class);
    }

    public function test_repeated_public_training_and_event_gets_are_not_rate_limited(): void
    {
        [$training, $event] = $this->resources();

        for ($attempt = 0; $attempt < 20; $attempt++) {
            $this->get(route('formations.details', $training->slug))->assertOk();
            $this->get(route('evenements.details', $event->slug))->assertOk();
        }
    }

    public function test_training_registration_is_protected_and_real_excess_returns_429(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post(route('trainings.register', 'limited-training'), [])->assertNotFound();
        }

        $this->post(route('trainings.register', 'limited-training'), [])->assertTooManyRequests();
    }

    public function test_event_registration_is_protected_and_real_excess_returns_429(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post(route('events.register', 'limited-event'), [])->assertNotFound();
        }

        $this->post(route('events.register', 'limited-event'), [])->assertTooManyRequests();
    }

    public function test_registration_counters_are_segmented_by_route_and_resource(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post(route('events.register', 'event-a'), [])->assertNotFound();
        }

        $this->post(route('events.register', 'event-b'), [])->assertNotFound();
        $this->post(route('trainings.register', 'event-a'), [])->assertNotFound();
    }

    public function test_event_form_has_one_post_call_and_a_synchronous_submission_lock(): void
    {
        $source = file_get_contents(resource_path('js/components/frontend/events/event-join.tsx'));

        $this->assertSame(1, substr_count($source, "post(route('events.register'"));
        $this->assertStringContainsString('const isSubmitting = useRef(false);', $source);
        $this->assertStringContainsString('if (isSubmitting.current || processing) return;', $source);
    }

    public function test_check_in_keeps_its_dedicated_60_per_minute_limit(): void
    {
        $middleware = app('router')->getRoutes()->getByName('events.check-in')->gatherMiddleware();

        $this->assertContains('admin.access', $middleware);
        $this->assertContains('throttle:60,1', $middleware);
        $this->assertNotContains('throttle:public-registration', $middleware);
    }

    private function resources(): array
    {
        $owner = User::factory()->create();
        $training = Training::query()->create([
            'title' => 'Formation navigation publique',
            'slug' => 'formation-navigation-publique',
            'excerpt' => 'Test',
            'content' => 'Contenu',
            'location' => 'En ligne',
            'start_date' => now()->addWeek(),
            'end_date' => now()->addWeek()->addHour(),
            'price' => 0,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now(),
        ]);
        $categoryId = DB::table('event_categories')->insertGetId([
            'name' => 'Navigation',
            'slug' => 'navigation-'.uniqid(),
            'color' => '#000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $event = Event::query()->create([
            'title' => 'Événement navigation publique',
            'slug' => 'evenement-navigation-publique',
            'description' => 'Test',
            'content' => 'Contenu',
            'location' => 'Lausanne',
            'category_id' => $categoryId,
            'user_id' => $owner->id,
            'start_date' => now()->addWeek(),
            'end_date' => now()->addWeek()->addHour(),
            'price' => 0,
            'max_participants' => 20,
            'is_published' => true,
            'published_at' => now(),
        ]);

        return [$training, $event];
    }
}
