<?php

namespace Tests\Feature;

use App\Models\Bundle;
use App\Models\Coupon;
use App\Models\Package;
use App\Models\PackageAddon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsTest extends TestCase
{
    use RefreshDatabase;

    // ---- Addons ----

    public function test_admin_can_create_a_fixed_addon(): void
    {
        $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/addons', [
            'service_type' => 'web',
            'name_ar' => 'صفحة إضافية',
            'price_type' => 'fixed',
            'price_egp' => 1500,
        ])->assertCreated()->assertJsonPath('addon.name_ar', 'صفحة إضافية');

        $this->assertDatabaseHas('package_addons', ['name_ar' => 'صفحة إضافية', 'price_egp' => 1500]);
    }

    public function test_percentage_addon_requires_percentage(): void
    {
        $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/addons', [
            'service_type' => 'web',
            'name_ar' => 'دعم سنوي',
            'price_type' => 'percentage',
        ])->assertStatus(422)->assertJsonValidationErrors('percentage');
    }

    public function test_admin_can_update_and_delete_an_addon(): void
    {
        $this->actingAsRole('admin');
        $addon = PackageAddon::factory()->create(['name_ar' => 'قديم']);

        $this->putJson("/api/v1/admin/addons/{$addon->id}", [
            'service_type' => $addon->service_type,
            'name_ar' => 'محدّث',
            'price_type' => 'fixed',
            'price_egp' => 999,
        ])->assertOk()->assertJsonPath('addon.name_ar', 'محدّث');

        $this->deleteJson("/api/v1/admin/addons/{$addon->id}")->assertOk();
        $this->assertDatabaseMissing('package_addons', ['id' => $addon->id]);
    }

    // ---- Bundles ----

    public function test_admin_can_create_a_bundle_with_packages(): void
    {
        $this->actingAsRole('admin');
        $p1 = Package::factory()->create();
        $p2 = Package::factory()->create();

        $res = $this->postJson('/api/v1/admin/bundles', [
            'name_ar' => 'باقة الإطلاق',
            'discount_type' => 'percentage',
            'discount_value' => 15,
            'package_ids' => [$p1->id, $p2->id],
        ])->assertCreated();

        $bundleId = $res->json('bundle.id');
        $this->assertDatabaseHas('bundles', ['id' => $bundleId, 'name_ar' => 'باقة الإطلاق']);
        $this->assertDatabaseHas('bundle_packages', ['bundle_id' => $bundleId, 'package_id' => $p1->id]);
        $this->assertDatabaseHas('bundle_packages', ['bundle_id' => $bundleId, 'package_id' => $p2->id]);
    }

    public function test_updating_a_bundle_syncs_its_packages(): void
    {
        $this->actingAsRole('admin');
        $p1 = Package::factory()->create();
        $p2 = Package::factory()->create();
        $bundle = Bundle::factory()->create();
        $bundle->packages()->sync([$p1->id]);

        $this->putJson("/api/v1/admin/bundles/{$bundle->id}", [
            'name_ar' => $bundle->name_ar,
            'discount_type' => 'fixed',
            'discount_value' => 2000,
            'package_ids' => [$p2->id],
        ])->assertOk();

        $this->assertDatabaseHas('bundle_packages', ['bundle_id' => $bundle->id, 'package_id' => $p2->id]);
        $this->assertDatabaseMissing('bundle_packages', ['bundle_id' => $bundle->id, 'package_id' => $p1->id]);
    }

    // ---- Coupons ----

    public function test_admin_can_create_a_coupon_and_code_is_uppercased(): void
    {
        $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/coupons', [
            'code' => 'welcome10',
            'discount_type' => 'percentage',
            'discount_value' => 10,
        ])->assertCreated()->assertJsonPath('coupon.code', 'WELCOME10');

        $this->assertDatabaseHas('coupons', ['code' => 'WELCOME10']);
    }

    public function test_duplicate_coupon_code_is_rejected(): void
    {
        $this->actingAsRole('admin');
        Coupon::factory()->create(['code' => 'DUPE']);

        $this->postJson('/api/v1/admin/coupons', [
            'code' => 'DUPE',
            'discount_type' => 'fixed',
            'discount_value' => 500,
        ])->assertStatus(422)->assertJsonValidationErrors('code');
    }

    public function test_expiry_must_be_after_start(): void
    {
        $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/coupons', [
            'code' => 'BADDATES',
            'discount_type' => 'fixed',
            'discount_value' => 500,
            'starts_at' => now()->addDays(5)->toDateTimeString(),
            'expires_at' => now()->addDay()->toDateTimeString(),
        ])->assertStatus(422)->assertJsonValidationErrors('expires_at');
    }

    // ---- Authorization ----

    public function test_non_admin_cannot_access_cms_endpoints(): void
    {
        $this->actingAsRole('user');

        $this->getJson('/api/v1/admin/addons')->assertForbidden();
        $this->getJson('/api/v1/admin/bundles')->assertForbidden();
        $this->getJson('/api/v1/admin/coupons')->assertForbidden();
    }
}
