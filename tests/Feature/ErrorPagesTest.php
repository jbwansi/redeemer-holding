<?php

namespace Tests\Feature;

use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    public function test_not_found_page_is_customized_and_safe(): void
    {
        $response = TestResponse::fromBaseResponse(response(view('errors.404'), 404));

        $response->assertNotFound()
            ->assertSee('404')
            ->assertSee('Retour')
            ->assertDontSee('Stack trace')
            ->assertDontSee('STRIPE_SECRET');
    }

    public function test_operational_error_pages_are_safe_and_keep_their_status(): void
    {
        foreach ([419, 500, 503] as $status) {
            $response = TestResponse::fromBaseResponse(response(view("errors.{$status}"), $status));
            $response->assertStatus($status)
                ->assertSee((string) $status)
                ->assertDontSee('Stack trace')
                ->assertDontSee('STRIPE_SECRET');
        }
    }
}
