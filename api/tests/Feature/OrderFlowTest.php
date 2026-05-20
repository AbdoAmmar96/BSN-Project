<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Package;
use App\Models\PackageAddon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_draft_order_with_addons(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        $addon = PackageAddon::factory()->create(['service_type' => 'web', 'price_type' => 'fixed', 'price_egp' => 3500]);

        $res = $this->postJson('/api/v1/orders', [
            'package_id' => $package->id,
            'addon_ids' => [$addon->id],
            'project_name' => 'متجري الجديد',
            'description' => 'تفاصيل المشروع هنا',
        ])->assertCreated();

        $res->assertJsonPath('order.subtotal', '23500.00');
        $res->assertJsonPath('order.deposit_amount', '9400.00'); // 40%
        $this->assertDatabaseHas('order_addons', ['package_addon_id' => $addon->id, 'price' => 3500]);
    }

    public function test_calculate_applies_a_percentage_coupon(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        Coupon::factory()->create(['code' => 'SUMMER2026', 'discount_type' => 'percentage', 'discount_value' => 10]);

        $this->postJson('/api/v1/orders/calculate', [
            'package_id' => $package->id,
            'coupon_code' => 'SUMMER2026',
        ])
            ->assertOk()
            ->assertJsonPath('discount', 2000) // 10% of 20000
            ->assertJsonPath('total', 18000)
            ->assertJsonPath('coupon_error', null);
    }

    public function test_coupon_validate_endpoint_rejects_wrong_service(): void
    {
        $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'marketing', 'price' => 10000]);
        Coupon::factory()->create(['code' => 'STUDENT', 'applies_to_services' => ['web', 'branding']]);

        $this->postJson('/api/v1/coupons/validate', [
            'code' => 'STUDENT',
            'package_id' => $package->id,
        ])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }

    public function test_checkout_locks_the_order_for_payment(): void
    {
        $user = $this->actingAsRole('user');
        $package = Package::factory()->create(['price' => 15000]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'status' => Order::STATUS_DRAFT,
            'project_name' => 'موقع',
        ]);

        $this->postJson("/api/v1/orders/{$order->id}/checkout")
            ->assertOk();

        $this->assertSame(Order::STATUS_PENDING_PAYMENT, $order->fresh()->status);
    }

    public function test_paying_an_order_creates_a_pending_assignment_project(): void
    {
        Mail::fake();
        Notification::fake();

        $user = $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'status' => Order::STATUS_PENDING_PAYMENT,
            'project_name' => 'متجر',
            'total' => 20000,
            'subtotal' => 20000,
            'deposit_amount' => 8000,
        ]);

        // Simulate the gateway webhook flipping the order to paid.
        $order->update(['status' => Order::STATUS_PAID, 'paid_at' => now()]);

        $order->refresh();
        $this->assertNotNull($order->project_id, 'project should be created');
        $this->assertNotNull($order->invoice_id, 'invoice should be created');

        $project = $order->project;
        $this->assertSame('pending_assignment', $project->status);
        $this->assertNull($project->lead_developer_id, 'no developer assigned yet');
    }

    public function test_deposit_payment_links_to_invoice_and_marks_it_partial(): void
    {
        Mail::fake();
        Notification::fake();

        $user = $this->actingAsRole('user');
        $package = Package::factory()->create(['service_type' => 'web', 'price' => 20000]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'status' => Order::STATUS_PENDING_PAYMENT,
            'project_name' => 'متجر',
            'total' => 20000,
            'subtotal' => 20000,
            'deposit_amount' => 8000,
        ]);

        // Pay the 40% deposit through the real payment path.
        $payment = \App\Models\Payment::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'amount' => 8000,
            'currency' => 'EGP',
            'gateway' => \App\Models\Payment::GATEWAY_MOCK,
            'status' => \App\Models\Payment::STATUS_PENDING,
        ]);
        $payment->markCompleted();

        $order->refresh();
        $invoice = $order->invoice;

        // Payment is now linked to the generated invoice.
        $this->assertSame($invoice->id, $payment->fresh()->invoice_id);
        // Invoice reflects the partial deposit.
        $this->assertSame('partial', $invoice->status);
        $this->assertEqualsWithDelta(8000, $invoice->paid_amount, 0.01);
        $this->assertEqualsWithDelta(12000, $invoice->remaining_amount, 0.01);
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        $package = Package::factory()->create();
        $other = \App\Models\User::factory()->create();
        $order = Order::factory()->create(['user_id' => $other->id, 'package_id' => $package->id]);

        $this->actingAsRole('user');
        $this->getJson("/api/v1/orders/{$order->id}")->assertStatus(403);
    }
}
