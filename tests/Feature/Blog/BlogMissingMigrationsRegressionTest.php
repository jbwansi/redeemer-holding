<?php

namespace Tests\Feature\Blog;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BlogMissingMigrationsRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_blog_migrations_reproduce_the_three_500s_and_applying_them_restores_the_contract(): void
    {
        // Destructive setup is strictly confined to the isolated in-memory test DB.
        $this->assertSame('testing', app()->environment());
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        config(['app.debug' => false]);
        $post = Post::create([
            'title' => 'Migration regression', 'slug' => 'migration-regression',
            'user_id' => User::factory()->create()->id,
            'published' => true, 'published_at' => now()->subDay(),
        ]);
        $paths = glob(database_path('migrations/2026_10_14_00000*_create_*_table.php'));
        $this->assertCount(5, $paths);
        foreach (array_reverse($paths) as $path) {
            (require $path)->down();
        }
        DB::table('migrations')->whereIn('migration', array_map(fn ($path) => basename($path, '.php'), $paths))->delete();

        foreach (['interactions', 'comments'] as $endpoint) {
            $response = $this->getJson('/blogs/'.$post->slug.'/'.$endpoint)->assertStatus(500);
            $this->assertStringNotContainsString('SQLSTATE', $response->getContent());
        }
        $this->postJson('/blogs/'.$post->slug.'/interaction-session')->assertStatus(500);

        $this->assertSame(0, Artisan::call('migrate', ['--path' => $paths, '--realpath' => true]));
        foreach (['blog_actors', 'post_likes', 'post_ratings', 'post_comments', 'post_comment_moderation_logs'] as $table) {
            $this->assertTrue(Schema::hasTable($table));
        }
        $this->getJson('/blogs/'.$post->slug.'/interactions')->assertOk()->assertExactJson([
            'likes_count' => 0, 'liked' => false, 'ratings_count' => 0,
            'rating_average' => null, 'my_rating' => null, 'comments_count' => 0,
        ]);
        $this->getJson('/blogs/'.$post->slug.'/comments')->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
        $this->postJson('/blogs/'.$post->slug.'/interaction-session')->assertOk()->assertJsonStructure(['comment_form_token']);
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'title' => 'Migration regression']);
        $this->assertDatabaseCount('posts', 1);
    }
}
