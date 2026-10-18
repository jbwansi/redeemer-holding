<?php

namespace Tests\Unit\Blog;

use Illuminate\Database\MySqlConnection;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BlogMySqlSchemaCompilationTest extends TestCase
{
    public function test_five_migrations_compile_with_mysql_grammar_without_any_database_connection(): void
    {
        $connection = new MySqlConnection(
            fn () => throw new \RuntimeException('A database connection is forbidden in this compilation test.'),
            'isolated_schema_review', '',
            ['charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'engine' => 'InnoDB'],
        );
        $previous = Schema::getFacadeRoot();
        Schema::swap($connection->getSchemaBuilder());
        try {
            $queries = $connection->pretend(function () {
                foreach (glob(database_path('migrations/2026_10_14_00000*_create_*_table.php')) as $path) {
                    (require $path)->up();
                }
            });
        } finally {
            Schema::swap($previous);
        }
        $sql = implode("\n", array_column($queries, 'query'));
        $this->assertSame(5, substr_count($sql, 'create table'));
        $this->assertStringContainsString("enum('1', '2', '3', '4', '5')", $sql);
        $this->assertStringContainsString('engine = InnoDB', $sql);
        $this->assertStringContainsString('`post_likes_post_id_blog_actor_id_unique`', $sql);
        $this->assertStringContainsString('`post_ratings_post_id_blog_actor_id_unique`', $sql);
        $this->assertStringContainsString('`post_comments_actor_submission_unique`', $sql);
        $this->assertStringContainsString('`post_comments_public_index`', $sql);
        $this->assertStringContainsString('on delete cascade', $sql);
        $this->assertStringContainsString('on delete restrict', $sql);
        $this->assertStringContainsString('on delete set null', $sql);
        preg_match_all('/(?:constraint|index|unique) `([^`]+)`/', $sql, $matches);
        foreach ($matches[1] as $identifier) {
            $this->assertLessThanOrEqual(64, strlen($identifier));
        }
    }
}
