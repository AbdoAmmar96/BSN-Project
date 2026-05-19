<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_responds_ok(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson(['ok' => true, 'service' => 'BSN API', 'version' => 'v1']);
    }

    public function test_unknown_api_path_returns_versioned_hint(): void
    {
        $this->getJson('/api/does-not-exist')
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }
}
