<?php

namespace Tests\Feature\Blog;

use App\Models\BlogActor;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\PostRating;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class BlogSchemaTest extends TestCase
{
    use RefreshDatabase;

    private function article(): Post
    {
        return Post::create([
            'title' => 'Article', 'slug' => (string) Str::uuid(),
            'user_id' => User::factory()->create()->id,
            'published' => true, 'published_at' => now(),
        ]);
    }

    private function actor(): BlogActor
    {
        return BlogActor::create(['kind' => 'anonymous', 'token_hash' => hash('sha256', random_bytes(32)), 'expires_at' => now()->addDay()]);
    }

    private function comment(Post $post, BlogActor $actor, array $attributes = []): PostComment
    {
        return $post->comments()->create(array_merge([
            'blog_actor_id' => $actor->id, 'display_name' => 'Visiteur',
            'body' => 'Un commentaire.', 'submission_key' => (string) Str::uuid(),
            'content_hash' => hash('sha256', 'Un commentaire.'),
        ], $attributes));
    }

    private function assertRejected(callable $write): void
    {
        try {
            $write();
            $this->fail('Database accepted invalid data.');
        } catch (QueryException $exception) {
            $this->assertNotEmpty($exception->getMessage());
        }
    }

    public function test_unique_votes_submissions_and_actor_credentials_are_enforced(): void
    {
        $post = $this->article();
        $actor = $this->actor();
        $values = ['post_id' => $post->id, 'blog_actor_id' => $actor->id];
        PostLike::create($values);
        $this->assertRejected(fn () => PostLike::create($values));
        PostRating::create($values + ['rating' => 4]);
        $this->assertRejected(fn () => PostRating::create($values + ['rating' => 5]));
        $comment = $this->comment($post, $actor);
        $this->assertRejected(fn () => $this->comment($post, $actor, ['submission_key' => $comment->submission_key]));
        $this->assertRejected(fn () => BlogActor::create(['kind' => 'anonymous', 'token_hash' => $actor->token_hash]));
        BlogActor::create(['kind' => 'user', 'user_id' => $post->user_id]);
        $this->assertRejected(fn () => BlogActor::create(['kind' => 'user', 'user_id' => $post->user_id]));
        // Other actors may vote on the same article.
        $post->likes()->create(['blog_actor_id' => $this->actor()->id]);
        $this->assertSame(2, $post->likes()->count());
    }

    public function test_database_rejects_invalid_ratings_statuses_and_foreign_keys(): void
    {
        $post = $this->article();
        $actor = $this->actor();
        foreach ([0, 6, -1, 'invalid'] as $rating) {
            $this->assertRejected(fn () => DB::table('post_ratings')->insert([
                'post_id' => $post->id, 'blog_actor_id' => $actor->id, 'rating' => $rating,
            ]));
        }
        $this->assertRejected(fn () => PostLike::create(['post_id' => 999999, 'blog_actor_id' => $actor->id]));
        $this->assertRejected(fn () => PostLike::create(['post_id' => $post->id, 'blog_actor_id' => 999999]));
        $this->assertRejected(fn () => $this->comment($post, $actor, ['status' => 'invalid']));
        foreach (range(1, 5) as $rating) {
            $record = $post->ratings()->create(['blog_actor_id' => $this->actor()->id, 'rating' => $rating]);
            $this->assertSame($rating, $record->refresh()->rating);
        }
    }

    public function test_relations_defaults_soft_delete_and_cascades_preserve_integrity(): void
    {
        $post = $this->article();
        $actor = $this->actor();
        $like = $post->likes()->create(['blog_actor_id' => $actor->id]);
        $rating = $post->ratings()->create(['blog_actor_id' => $actor->id, 'rating' => 5]);
        $pending = $this->comment($post, $actor)->refresh();
        $approved = $this->comment($post, $actor, ['status' => 'approved']);
        $moderator = User::factory()->create();
        $log = $approved->moderationLogs()->create([
            'moderator_id' => $moderator->id, 'from_status' => 'pending', 'to_status' => 'approved', 'reason' => 'Interne',
        ]);
        $this->assertSame('pending', $pending->status);
        $this->assertSame(1, $post->approvedComments()->count());
        $this->assertTrue($like->post->is($post));
        $this->assertTrue($rating->actor->is($actor));
        $this->assertTrue($pending->actor->is($actor));
        $this->assertTrue($log->comment->is($approved));
        $this->assertTrue($log->moderator->is($moderator));
        $this->assertSame(2, $actor->comments()->count());
        $this->assertSame(1, $actor->likes()->count());
        $this->assertSame(1, $actor->ratings()->count());
        $this->assertArrayNotHasKey('blog_actor_id', $pending->toArray());
        $this->assertArrayNotHasKey('reason', $log->toArray());
        $this->assertRejected(fn () => $actor->delete());
        $moderator->delete();
        $this->assertNull($log->refresh()->moderator_id);
        $post->delete();
        $this->assertNull(Post::published()->find($post->id));
        $this->assertDatabaseCount('post_comments', 2);
        $post->restore();
        $this->assertSame(1, $post->approvedComments()->count());
        $post->forceDelete();
        foreach (['post_likes', 'post_ratings', 'post_comments', 'post_comment_moderation_logs'] as $table) {
            $this->assertDatabaseCount($table, 0);
        }
        $this->assertDatabaseHas('blog_actors', ['id' => $actor->id]);
    }
}
