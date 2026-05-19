<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Auth a user as the given role and return the user + bearer token header.
     */
    protected function actingAsRole(string $role = 'user', array $overrides = []): \App\Models\User
    {
        /** @var \App\Models\User $user */
        $user = \App\Models\User::factory()->create(array_merge([
            'role' => $role,
            'is_active' => true,
        ], $overrides));

        $this->actingAs($user, 'sanctum');

        return $user;
    }
}
