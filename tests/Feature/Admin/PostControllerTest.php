<?php

namespace Tests\Feature\Admin;

use App\Models\Post;
use App\Models\User;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\RequireAdminAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([
            RequireAdminAccess::class,
            EnsureUserIsActive::class,
        ]);
    }

    public function test_post_update_keeps_existing_image_when_no_replacement_is_uploaded(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $post = Post::create([
            'slug' => 'article-test',
            'title' => 'Titre initial',
            'featured_image' => json_encode([
                'medium' => 'posts/medium-image.jpg',
            ]),
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post(route('posts.update', $post), [
            'title' => 'Titre modifie',
            'featured_image' => null,
            'category_ids' => [],
        ]);

        $response->assertRedirect(route('posts.index'));
        $response->assertSessionHasNoErrors();
        $this->assertSame(
            ['medium' => 'posts/medium-image.jpg'],
            json_decode($post->refresh()->getRawOriginal('featured_image'), true)
        );
    }
}