<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    private function validate(array $payload)
    {
        return $this->postJson('/api/v1/coupons/validate', $payload);
    }

    public function test_valid_percentage_coupon_returns_discount(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        Coupon::factory()->create(['code' => 'TENOFF', 'discount_type' => 'percentage', 'discount_value' => 10]);

        $this->validate(['code' => 'TENOFF', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('discount', 2000) // 10% of 20000
            ->assertJsonPath('total', 18000);
    }

    public function test_fixed_coupon_returns_flat_discount(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        Coupon::factory()->fixed(1500)->create(['code' => 'FLAT1500']);

        $this->validate(['code' => 'FLAT1500', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('discount', 1500)
            ->assertJsonPath('total', 18500);
    }

    public function test_percentage_coupon_respects_max_discount_ceiling(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        // 50% would be 10000, but the ceiling caps it at 3000.
        Coupon::factory()->create([
            'code' => 'BIG50',
            'discount_type' => 'percentage',
            'discount_value' => 50,
            'max_discount_egp' => 3000,
        ]);

        $this->validate(['code' => 'BIG50', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('discount', 3000)
            ->assertJsonPath('total', 17000);
    }

    public function test_unknown_code_is_invalid(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);

        $this->validate(['code' => 'NOPE', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', false)
            ->assertJsonPath('discount', 0);
    }

    public function test_expired_coupon_is_rejected(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        Coupon::factory()->expired()->create(['code' => 'OLD']);

        $this->validate(['code' => 'OLD', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }

    public function test_inactive_coupon_is_rejected(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        Coupon::factory()->create(['code' => 'OFF', 'is_active' => false]);

        $this->validate(['code' => 'OFF', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }

    public function test_coupon_scoped_to_other_service_is_rejected(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'marketing', 'price' => 10000]);
        Coupon::factory()->create(['code' => 'WEBONLY', 'applies_to_services' => ['web']]);

        $this->validate(['code' => 'WEBONLY', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }

    public function test_coupon_at_global_usage_limit_is_rejected(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        Coupon::factory()->create([
            'code' => 'MAXED',
            'usage_limit' => 5,
            'usage_count' => 5, // already fully consumed
        ]);

        $this->validate(['code' => 'MAXED', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }

    public function test_coupon_at_per_user_limit_is_rejected(): void
    {
        $user = $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        $coupon = Coupon::factory()->create(['code' => 'ONCE', 'per_user_limit' => 1]);

        // The user already redeemed it on a non-draft order.
        Order::factory()->create([
            'user_id' => $user->id,
            'coupon_id' => $coupon->id,
            'status' => Order::STATUS_PAID,
        ]);

        $this->validate(['code' => 'ONCE', 'package_id' => $package->id])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }
}
