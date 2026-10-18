<?php

namespace Tests\Feature\Admin;

use App\Models\BlogActor;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostCommentModerationLog;
use App\Models\User;
use App\Services\Blog\PostCommentModerationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PostCommentModerationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Post $post;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->post = Post::create(['title' => 'Article', 'slug' => 'moderation', 'user_id' => $this->admin->id, 'published' => true, 'published_at' => now()->subDay()]);
    }

    private function comment(string $status = 'pending'): PostComment
    {
        return $this->post->comments()->create([
            'blog_actor_id' => BlogActor::create(['kind' => 'anonymous'])->id,
            'display_name' => 'Visiteur', 'body' => '<script>untrusted()</script>', 'status' => $status,
            'submission_key' => (string) Str::uuid(), 'content_hash' => hash('sha256', 'body'),
        ]);
    }

    public function test_access_is_restricted_to_active_administrators(): void
    {
        $comment = $this->comment();
        $url = route('post-comments.status', $comment);
        $this->get(route('post-comments.index'))->assertRedirect(route('login'));
        $this->patch($url, ['status' => 'approved', 'expected_version' => 0])->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create(['role' => 'client', 'is_active' => true]));
        $this->get(route('post-comments.index'))->assertForbidden();
        $this->patchJson($url, ['status' => 'approved', 'expected_version' => 0])->assertForbidden();
        $this->actingAs($this->admin);
        $this->get(route('post-comments.index'))->assertOk();
        $this->admin->forceFill(['is_active' => false])->save();
        $this->patch($url, ['status' => 'approved', 'expected_version' => 0])->assertRedirect(route('account.inactive'));
        $this->assertDatabaseCount('post_comment_moderation_logs', 0);
    }

    public static function transitions(): array
    {
        $allowed = ['pending:approved', 'pending:rejected', 'pending:spam', 'approved:rejected', 'approved:spam', 'rejected:pending', 'spam:pending'];
        $cases = [];
        foreach (['pending', 'approved', 'rejected', 'spam'] as $from) {
            foreach (['pending', 'approved', 'rejected', 'spam'] as $to) {
                $cases[$from.':'.$to] = [$from, $to, in_array($from.':'.$to, $allowed, true)];
            }
        }

        return $cases;
    }

    #[DataProvider('transitions')]
    public function test_all_transitions_and_audit_records(string $from, string $to, bool $allowed): void
    {
        $comment = $this->comment($from);
        $response = $this->actingAs($this->admin)->patchJson(route('post-comments.status', $comment), [
            'status' => $to, 'expected_version' => 0, 'reason' => 'Motif privé', 'moderator_id' => 999,
        ]);
        if ($allowed) {
            $response->assertRedirect()->assertSessionHas('success');
            $this->assertSame($to, $comment->refresh()->status);
            $log = $comment->moderationLogs()->sole();
            $this->assertSame($this->admin->id, $log->moderator_id);
            $this->assertSame($from, $log->from_status);
            $this->assertSame($to, $log->to_status);
            $this->assertSame('Motif privé', $log->reason);
            $this->assertNotNull($log->created_at);
        } else {
            $response->assertUnprocessable()->assertJsonValidationErrors('status');
            $this->assertSame($from, $comment->refresh()->status);
            $this->assertDatabaseCount('post_comment_moderation_logs', 0);
        }
    }

    public function test_stale_decisions_are_rejected_even_after_a_status_round_trip(): void
    {
        $comment = $this->comment();
        $url = route('post-comments.status', $comment);
        $this->actingAs($this->admin)->patchJson($url, ['status' => 'rejected', 'expected_version' => 0])->assertRedirect();
        $other = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($other)->patchJson($url, ['status' => 'pending', 'expected_version' => 0])->assertUnprocessable()->assertJsonValidationErrors('conflict');
        $this->patchJson($url, ['status' => 'pending', 'expected_version' => $comment->moderationLogs()->max('id')])->assertRedirect();
        $this->actingAs($this->admin)->patchJson($url, ['status' => 'approved', 'expected_version' => 0])->assertUnprocessable()->assertJsonValidationErrors('conflict');
        $this->assertSame('pending', $comment->refresh()->status);
        $this->assertSame(2, $comment->moderationLogs()->count());
    }

    public function test_validation_and_csrf(): void
    {
        $comment = $this->comment();
        $this->actingAs($this->admin);
        foreach ([['status' => 'invalid', 'expected_version' => 0], ['status' => 'approved'],
            ['status' => 'approved', 'expected_version' => -1], ['status' => 'approved', 'expected_version' => 0, 'reason' => str_repeat('a', 2001)]] as $payload) {
            $this->patchJson(route('post-comments.status', $comment), $payload)->assertUnprocessable();
        }
        $this->app->instance('env', 'csrf-test');
        $this->patchJson(route('post-comments.status', $comment), ['status' => 'approved', 'expected_version' => 0])->assertStatus(419);
        $this->assertDatabaseCount('post_comment_moderation_logs', 0);
    }

    public function test_pagination_filters_and_deleted_article_context(): void
    {
        foreach (range(1, 22) as $i) {
            $this->comment($i === 22 ? 'approved' : 'pending');
        }
        $other = $this->post->replicate();
        $other->slug = 'other';
        $other->save();
        $this->comment()->update(['post_id' => $other->id]);
        $this->post->delete();
        $this->actingAs($this->admin)->get(route('post-comments.index', ['status' => 'pending', 'post_id' => $this->post->id]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('backend/blogs/comments/index', false)
            ->has('comments.data', 20)->where('comments.total', 21)->where('comments.data.0.post.deleted', true)
            ->where('comments.data.0.version', 0)->missing('comments.data.0.blog_actor_id')->missing('comments.data.0.content_hash'));
        $this->get(route('post-comments.index', ['status' => 'pending', 'post_id' => $this->post->id, 'page' => 2]))
            ->assertInertia(fn (Assert $page) => $page->has('comments.data', 1)->where('comments.current_page', 2));
        $this->getJson(route('post-comments.index', ['status' => 'invalid']))->assertUnprocessable();
    }

    public function test_public_visibility_changes_without_exposing_private_audit_data(): void
    {
        $comment = $this->comment();
        $this->getJson('/blogs/moderation/comments')->assertJsonCount(0, 'data');
        $this->actingAs($this->admin)->patchJson(route('post-comments.status', $comment), ['status' => 'approved', 'expected_version' => 0, 'reason' => 'Secret interne'])->assertRedirect();
        $response = $this->getJson('/blogs/moderation/comments')->assertJsonCount(1, 'data');
        $this->assertStringNotContainsString('Secret interne', $response->getContent());
        $this->assertSame(['id', 'display_name', 'body', 'created_at'], array_keys($response->json('data.0')));
        $this->patchJson(route('post-comments.status', $comment), ['status' => 'spam', 'expected_version' => $comment->moderationLogs()->max('id')])->assertRedirect();
        $this->getJson('/blogs/moderation/comments')->assertJsonCount(0, 'data');
        $this->getJson('/blogs/moderation/interactions')->assertJsonPath('comments_count', 0);
    }

    public function test_audit_failure_rolls_back_the_status_change(): void
    {
        $comment = $this->comment();
        PostCommentModerationLog::creating(fn () => throw new \RuntimeException('Audit unavailable'));
        try {
            app(PostCommentModerationService::class)->moderate($comment, $this->admin, 'approved', 0, null);
            $this->fail('Expected audit failure');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Audit unavailable', $exception->getMessage());
        } finally {
            PostCommentModerationLog::flushEventListeners();
        }
        $this->assertSame('pending', $comment->refresh()->status);
        $this->assertDatabaseCount('post_comment_moderation_logs', 0);
    }
}
