<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_has_role_matches_the_users_role(): void
    {
        $user = new User(['role' => 'admin']);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('client'));
    }

    public function test_is_admin_uses_the_admin_role(): void
    {
        $admin = new User(['role' => 'admin']);
        $client = new User(['role' => 'client']);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($client->isAdmin());
    }
}
