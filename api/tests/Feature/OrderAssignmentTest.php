<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Package;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderAssignmentTest extends TestCase
{
    use RefreshDatabase;

    /** A completed deposit payment flips the order to paid → project created. */
    public function test_completed_payment_fulfils_the_order(): void
    {
        Notification::fake();
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();
        $package = Package::factory()->create(['service_type' => 'web']);

        $order = Order::factory()->create([
            'user_id' => $client->id,
            'package_id' => $package->id,
            'status' => Order::STATUS_PENDING_PAYMENT,
            'total' => 20000,
            'subtotal' => 20000,
            'deposit_amount' => 8000,
        ]);

        $payment = Payment::create([
            'reference' => 'PAY-TEST-1',
            'user_id' => $client->id,
            'order_id' => $order->id,
            'amount' => 8000,
            'currency' => 'EGP',
            'gateway' => Payment::GATEWAY_PAYMOB_CARD,
        ]);

        $payment->markCompleted([]);

        $order->refresh();
        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertNotNull($order->project_id);
        $this->assertSame('pending_assignment', $order->project->status);
    }

    public function test_admin_can_assign_a_developer(): void
    {
        Notification::fake();
        $admin = User::factory()->admin()->create();
        $dev = User::factory()->developer()->create();
        $order = $this->paidOrderWithProject();

        $this->actingAs($admin, 'sanctum');
        $this->postJson("/api/v1/admin/orders/{$order->id}/assign", ['developer_id' => $dev->id])
            ->assertOk();

        $order->refresh();
        $this->assertSame(Order::STATUS_IN_PROGRESS, $order->status);
        $this->assertSame($dev->id, $order->assigned_developer_id);
        $this->assertNotNull($order->developer_assigned_at);
        $this->assertSame('in_progress', $order->project->fresh()->status);
        $this->assertSame($dev->id, $order->project->fresh()->lead_developer_id);
    }

    public function test_cannot_assign_a_non_developer(): void
    {
        $admin = User::factory()->admin()->create();
        $notDev = User::factory()->create(); // role: user
        $order = $this->paidOrderWithProject();

        $this->actingAs($admin, 'sanctum');
        $this->postJson("/api/v1/admin/orders/{$order->id}/assign", ['developer_id' => $notDev->id])
            ->assertStatus(422);
    }

    public function test_non_admin_cannot_assign(): void
    {
        $dev = User::factory()->developer()->create();
        $order = $this->paidOrderWithProject();

        $this->actingAsRole('user');
        $this->postJson("/api/v1/admin/orders/{$order->id}/assign", ['developer_id' => $dev->id])
            ->assertStatus(403);
    }

    public function test_pending_assignment_queue_filter(): void
    {
        $admin = User::factory()->admin()->create();
        $this->paidOrderWithProject();

        $this->actingAs($admin, 'sanctum');
        $res = $this->getJson('/api/v1/admin/orders?pending_assignment=1')->assertOk();
        $this->assertGreaterThanOrEqual(1, count($res->json('data')));
    }

    /** Helper: a paid order whose project already exists (post-OrderObserver). */
    private function paidOrderWithProject(): Order
    {
        Notification::fake();
        $client = User::factory()->create();
        $package = Package::factory()->create(['service_type' => 'web']);
        $order = Order::factory()->create([
            'user_id' => $client->id,
            'package_id' => $package->id,
            'status' => Order::STATUS_PENDING_PAYMENT,
            'total' => 20000,
            'subtotal' => 20000,
            'deposit_amount' => 8000,
        ]);
        // Trigger the observer to create project + chat room.
        $order->update(['status' => Order::STATUS_PAID, 'paid_at' => now()]);

        return $order->fresh();
    }
}
