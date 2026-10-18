<?php

namespace Tests\Unit\Blog;

use App\Services\Blog\BlogActorService;
use Illuminate\Http\Request;
use Tests\TestCase;

class BlogActorInputTest extends TestCase
{
    public function test_missing_or_malformed_credentials_are_rejected_without_database_access(): void
    {
        $queries = $this->app['db']->connection()->pretend(function () {
            foreach ([null, '', '123', str_repeat('z', 64), ['unexpected'], str_repeat('a', 65)] as $value) {
                $request = Request::create('/blogs/example');
                $request->cookies->set(config('blog.anonymous_cookie'), $value);
                $this->assertNull(app(BlogActorService::class)->resolve($request));
            }
        });
        $this->assertSame([], $queries);
    }
}
