<?php

namespace Tests\Feature;

use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_active_packages(): void
    {
        Package::factory()->count(3)->create(['is_active' => true]);
        Package::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/packages');

        $response->assertOk();
        $this->assertCount(3, $response->json('data') ?? $response->json());
    }

    public function test_admin_can_create_package(): void
    {
        $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/packages', [
            'service_type' => 'web',
            'name' => 'Landing Page',
            'price' => 8500,
            'features' => ['تصميم مخصص', 'صفحة واحدة'],
            'is_active' => true,
        ])->assertCreated();

        $this->assertDatabaseHas('packages', ['name' => 'Landing Page', 'price' => 8500]);
    }

    public function test_non_admin_cannot_create_package(): void
    {
        $this->actingAsRole('user');

        $this->postJson('/api/v1/admin/packages', [
            'service_type' => 'web',
            'name' => 'X',
            'price' => 100,
        ])->assertStatus(403);
    }

    public function test_admin_can_update_package(): void
    {
        $this->actingAsRole('admin');
        $package = Package::factory()->create(['price' => 5000]);

        $this->putJson("/api/v1/admin/packages/{$package->id}", [
            'service_type' => $package->service_type,
            'name' => $package->name,
            'price' => 7500,
        ])->assertOk();

        $this->assertDatabaseHas('packages', ['id' => $package->id, 'price' => 7500]);
    }

    public function test_admin_can_delete_package(): void
    {
        $this->actingAsRole('admin');
        $package = Package::factory()->create();

        $this->deleteJson("/api/v1/admin/packages/{$package->id}")
            ->assertOk();

        $this->assertDatabaseMissing('packages', ['id' => $package->id]);
    }
}
