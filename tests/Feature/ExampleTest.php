<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_home_redirects_guest_to_login_in_testing_environment(): void
    {
        $this->get('/')->assertRedirect(route('login'));
    }
}
