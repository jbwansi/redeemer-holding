<?php

namespace Tests\Feature\Blog;

use App\Models\BlogActor;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BlogEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private Post $post;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withCredentials();
        $this->post = Post::create(['title' => 'Article', 'slug' => 'article', 'user_id' => User::factory()->create()->id,
            'published' => true, 'published_at' => now()->subDay()]);
    }

    private function initialize(): string
    {
        $response = $this->postJson('/blogs/article/interaction-session')->assertOk();
        $cookie = collect($response->headers->getCookies())->first(fn ($cookie) => $cookie->getName() === config('blog.anonymous_cookie'));
        if ($cookie) {
            $this->withUnencryptedCookie($cookie->getName(), $cookie->getValue());
        }

        return $response->json('comment_form_token');
    }

    private function comment(string $token, array $extra = []): array
    {
        return array_merge(['comment_form_token' => $token, 'display_name' => 'Visiteur', 'body' => 'Très bon article.', 'website' => ''], $extra);
    }

    public function test_anonymous_likes_and_ratings_are_idempotent_and_private(): void
    {
        $this->getJson('/blogs/article/interactions')->assertOk()->assertJsonPath('rating_average', null);
        $this->assertDatabaseCount('blog_actors', 0);
        $this->putJson('/blogs/article/like', ['actor_id' => 1])->assertForbidden();
        $this->initialize();
        foreach (range(1, 2) as $attempt) {
            $response = $this->putJson('/blogs/article/like', ['actor_id' => 999]);
            $response->assertOk()->assertJsonPath('likes_count', 1)->assertJsonPath('liked', true);
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }
        $this->putJson('/blogs/article/rating', ['rating' => 2])->assertOk()->assertJsonPath('my_rating', 2);
        $this->putJson('/blogs/article/rating', ['rating' => 5])->assertOk()->assertJsonPath('ratings_count', 1)->assertJsonPath('rating_average', 5);
        foreach (range(1, 2) as $attempt) {
            $this->deleteJson('/blogs/article/like')->assertOk()->assertJsonPath('likes_count', 0);
            $this->deleteJson('/blogs/article/rating')->assertOk()->assertJsonPath('ratings_count', 0)->assertJsonPath('my_rating', null);
        }
        $this->assertSame(0, $this->post->refresh()->views);
        $this->assertDatabaseCount('post_view_logs', 0);
    }

    public function test_invalid_ratings_are_rejected(): void
    {
        $this->initialize();
        foreach ([0, 6, -1, 1.5, true, 'five', null, [], '2.0'] as $rating) {
            $this->putJson('/blogs/article/rating', ['rating' => $rating])->assertUnprocessable()->assertJsonValidationErrors('rating');
        }
        $this->assertDatabaseCount('post_ratings', 0);
    }

    public function test_comments_are_pending_deduplicated_and_never_accept_client_ownership_or_status(): void
    {
        $token = $this->initialize();
        $this->travel(4)->seconds();
        $data = $this->comment($token, ['status' => 'approved', 'blog_actor_id' => 999, 'user_id' => 999]);
        $this->postJson('/blogs/article/comments', $data)->assertStatus(202);
        $this->postJson('/blogs/article/comments', $data)->assertStatus(202);
        $this->assertDatabaseCount('post_comments', 1);
        $comment = $this->post->comments()->first();
        $this->assertSame('pending', $comment->status);
        $this->assertSame(BlogActor::first()->id, $comment->blog_actor_id);
        $this->getJson('/blogs/article/comments')->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
        $this->getJson('/blogs/article/interactions')->assertJsonPath('comments_count', 0);
        $fresh = $this->initialize();
        $this->travel(4)->seconds();
        $this->postJson('/blogs/article/comments', $this->comment($fresh))->assertUnprocessable()->assertJsonValidationErrors('body');
        $this->assertDatabaseCount('post_comments', 1);
    }

    public function test_comment_validation_honeypot_timing_and_token_binding(): void
    {
        config(['blog.limits.comments_per_ten_minutes' => 100, 'blog.limits.comments_per_day' => 100]);
        $token = $this->initialize();
        $this->postJson('/blogs/article/comments', $this->comment($token))->assertUnprocessable();
        $this->travel(4)->seconds();
        foreach ([['display_name' => ''], ['body' => '  '], ['body' => str_repeat('é', 3001)], ['body' => '<script>alert(1)</script>'],
            ['website' => 'spam'], ['comment_form_token' => 'fake'], ['body' => 'https://a.test https://b.test https://c.test']] as $invalid) {
            $this->postJson('/blogs/article/comments', $this->comment($token, $invalid))->assertUnprocessable();
        }
        $this->actingAs(User::factory()->create(['is_active' => true]));
        $this->postJson('/blogs/article/comments', $this->comment($token))->assertUnprocessable();
        $accountToken = $this->initialize();
        $this->travel(3601)->seconds();
        $this->postJson('/blogs/article/comments', $this->comment($accountToken))->assertUnprocessable();
        $this->assertDatabaseCount('post_comments', 0);
    }

    public function test_chosen_name_does_not_change_account_identity_and_average_combines_distinct_actors(): void
    {
        $this->initialize();
        $this->putJson('/blogs/article/rating', ['rating' => 2])->assertOk();
        $user = User::factory()->create(['is_active' => true, 'name' => 'Membre']);
        $this->actingAs($user);
        $token = $this->initialize();
        $this->putJson('/blogs/article/rating', ['rating' => 5])->assertJsonPath('rating_average', 3.5)->assertJsonPath('ratings_count', 2);
        $this->travel(4)->seconds();
        $this->postJson('/blogs/article/comments', ['comment_form_token' => $token, 'body' => 'Bonjour',
            'display_name' => 'Prénom choisi', 'blog_actor_id' => 999, 'user_id' => 999, 'status' => 'approved'])->assertStatus(202);
        $actor = BlogActor::where('user_id', $user->id)->sole();
        $this->assertDatabaseHas('post_comments', ['display_name' => 'Prénom choisi', 'status' => 'pending', 'blog_actor_id' => $actor->id]);
        $this->assertSame('Membre', $user->fresh()->name);
        $this->getJson('/blogs/article/comments')->assertJsonCount(0, 'data');
        $user->forceFill(['is_active' => false])->save();
        $this->putJson('/blogs/article/like')->assertForbidden();
    }

    public function test_display_name_is_required_plain_text_and_at_most_eighty_characters_for_every_visitor(): void
    {
        config(['blog.limits.comments_per_ten_minutes' => 100, 'blog.limits.comments_per_day' => 100]);
        foreach ([false, true] as $signedIn) {
            if ($signedIn) {
                $this->actingAs(User::factory()->create(['is_active' => true]));
            }
            $token = $this->initialize();
            $this->travel(4)->seconds();
            foreach ([null, '', '   ', str_repeat('é', 81), '<b>Marie</b>', ['Marie']] as $name) {
                $this->postJson('/blogs/article/comments', $this->comment($token, ['display_name' => $name]))
                    ->assertUnprocessable()->assertJsonValidationErrors('display_name');
            }
            $data = $this->comment($token);
            unset($data['display_name']);
            $this->postJson('/blogs/article/comments', $data)->assertUnprocessable()->assertJsonValidationErrors('display_name');
            $this->postJson('/blogs/article/comments', $this->comment($token, ['display_name' => str_repeat('é', 80)]))->assertStatus(202);
        }
        $this->assertDatabaseCount('post_comments', 2);
        $this->assertDatabaseHas('post_comments', ['display_name' => str_repeat('é', 80), 'status' => 'pending']);
    }

    public function test_public_comments_are_paginated_and_allowlisted(): void
    {
        $this->initialize();
        $actor = BlogActor::first();
        foreach (range(1, 14) as $i) {
            $this->post->comments()->create(['blog_actor_id' => $actor->id, 'display_name' => 'Nom', 'body' => 'Texte '.$i,
                'status' => $i <= 12 ? 'approved' : ($i === 13 ? 'rejected' : 'spam'),
                'submission_key' => (string) Str::uuid(), 'content_hash' => hash('sha256', (string) $i)]);
        }
        $response = $this->getJson('/blogs/article/comments?per_page=1000&status=spam')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 12);
        $this->assertSame(['id', 'display_name', 'body', 'created_at'], array_keys($response->json('data.0')));
        $this->getJson('/blogs/article/comments?page=2')->assertJsonCount(2, 'data');
        $this->getJson('/blogs/article/comments?page=-1')->assertUnprocessable();
        $this->getJson('/blogs/article/interactions')->assertJsonPath('comments_count', 12);
    }

    public function test_all_endpoints_require_a_currently_published_article(): void
    {
        $this->initialize();
        foreach (['draft', 'future', 'deleted', 'missing'] as $state) {
            $this->post->forceFill(['published' => $state !== 'draft', 'published_at' => $state === 'future' ? now()->addDay() : now()->subDay(),
                'deleted_at' => $state === 'deleted' ? now() : null])->save();
            $slug = $state === 'missing' ? 'missing' : 'article';
            foreach ([['POST', 'interaction-session'], ['GET', 'interactions'], ['PUT', 'like'], ['DELETE', 'like'],
                ['PUT', 'rating'], ['DELETE', 'rating'], ['GET', 'comments'], ['POST', 'comments']] as [$method, $path]) {
                $this->json($method, '/blogs/'.$slug.'/'.$path)->assertNotFound();
            }
        }
        $this->assertDatabaseCount('post_likes', 0);
    }

    public function test_rate_limits_are_enforced(): void
    {
        config(['blog.limits.writes_per_minute' => 2, 'blog.limits.initializations_per_minute' => 1]);
        $this->initialize();
        $this->postJson('/blogs/article/interaction-session')->assertStatus(429)->assertHeader('Retry-After');
        $this->putJson('/blogs/article/like')->assertOk();
        $this->deleteJson('/blogs/article/like')->assertOk();
        $this->putJson('/blogs/article/like')->assertStatus(429);
    }

    public function test_real_csrf_middleware_rejects_mutations_without_a_token(): void
    {
        // Laravel bypasses CSRF while runningUnitTests(); change only that flag.
        $this->app->instance('env', 'csrf-test');
        foreach ([['POST', 'interaction-session'], ['PUT', 'like'], ['DELETE', 'like'], ['PUT', 'rating'],
            ['DELETE', 'rating'], ['POST', 'comments']] as [$method, $path]) {
            $this->json($method, '/blogs/article/'.$path)->assertStatus(419);
        }
        $this->assertDatabaseCount('blog_actors', 0);
        $this->withSession(['_token' => 'test-csrf'])->withHeader('X-CSRF-TOKEN', 'test-csrf')
            ->postJson('/blogs/article/interaction-session')->assertOk();
    }

    public function test_cookie_expiration_tampering_and_personal_state_isolation(): void
    {
        $this->initialize();
        $cookie = $this->unencryptedCookies[config('blog.anonymous_cookie')];
        $this->putJson('/blogs/article/like')->assertOk();
        $this->withUnencryptedCookie(config('blog.anonymous_cookie'), $cookie.'broken');
        $this->putJson('/blogs/article/like')->assertForbidden();
        $this->getJson('/blogs/article/interactions')->assertJsonPath('liked', false)->assertJsonPath('likes_count', 1);
        $this->withUnencryptedCookie(config('blog.anonymous_cookie'), $cookie);
        BlogActor::query()->update(['expires_at' => now()->subSecond()]);
        $this->deleteJson('/blogs/article/like')->assertForbidden();
        $this->initialize();
        $this->getJson('/blogs/article/interactions')->assertJsonPath('liked', false)->assertJsonPath('likes_count', 1);
        $this->assertDatabaseCount('blog_actors', 2);
    }

    public function test_form_is_article_bound_and_retries_cannot_change_the_comment(): void
    {
        $token = $this->initialize();
        $other = $this->post->replicate();
        $other->slug = 'other';
        $other->save();
        $this->travel(4)->seconds();
        $this->postJson('/blogs/other/comments', $this->comment($token))->assertUnprocessable();
        $this->postJson('/blogs/article/comments', $this->comment($token))->assertStatus(202);
        $this->postJson('/blogs/article/comments', $this->comment($token, ['body' => 'Changed']))->assertUnprocessable();
        $this->assertDatabaseCount('post_comments', 1);
    }

    public function test_comment_and_network_limits_apply_across_articles(): void
    {
        config(['blog.limits.comments_per_ten_minutes' => 1]);
        $token = $this->initialize();
        $this->travel(4)->seconds();
        $this->postJson('/blogs/article/comments', $this->comment($token))->assertStatus(202);
        $this->postJson('/blogs/article/comments', $this->comment($token))->assertStatus(429)->assertHeader('Retry-After');
        $this->travel(11)->minutes();
        $this->postJson('/blogs/article/comments', $this->comment($token))->assertStatus(202);
        $this->assertDatabaseCount('post_comments', 1);
        config(['blog.limits.network_per_minute' => 1]);
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.80']);
        $this->getJson('/blogs/article/interactions')->assertOk();
        $this->getJson('/blogs/article/comments')->assertStatus(429);
    }
}
