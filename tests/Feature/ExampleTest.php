<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_is_publicly_accessible_in_testing_environment(): void
    {
        $this->get('/')->assertOk();
    }
}