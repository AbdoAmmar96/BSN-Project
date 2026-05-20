<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Order;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class QuoteFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_a_lead(): void
    {
        Notification::fake();
        User::factory()->admin()->create();
        $this->actingAsRole('user');

        $this->postJson('/api/v1/leads', [
            'service_type' => 'web',
            'title' => 'موقع شركة عقارات',
            'description' => 'محتاج موقع كامل مع CRM',
            'smart_answers' => ['pages' => 'multi', 'cms' => 'yes'],
            'budget_min_egp' => 30000,
            'budget_max_egp' => 60000,
        ])->assertCreated();

        $this->assertDatabaseHas('leads', ['title' => 'موقع شركة عقارات', 'status' => 'new']);
    }

    public function test_admin_builds_and_sends_a_quote_then_user_accepts(): void
    {
        Notification::fake();
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $client->id, 'service_type' => 'web']);

        // Admin assigns self + builds a quote with items
        $this->actingAs($admin, 'sanctum');
        $this->postJson("/api/v1/admin/leads/{$lead->id}/assign")->assertOk();

        $build = $this->postJson("/api/v1/admin/leads/{$lead->id}/quote", [
            'estimated_days' => 45,
            'items' => [
                ['label' => 'Design', 'unit_price' => 12000, 'quantity' => 1],
                ['label' => 'Development', 'unit_price' => 18000, 'quantity' => 1],
            ],
        ])->assertCreated();

        $quoteId = $build->json('quote.id');
        $this->assertSame('30000.00', (string) Quote::find($quoteId)->total);

        // Send to client
        $this->postJson("/api/v1/admin/quotes/{$quoteId}/send")->assertOk();
        $this->assertSame('sent', Quote::find($quoteId)->status);

        // Client views + accepts → an order is created
        $this->actingAs($client, 'sanctum');
        $this->getJson("/api/v1/quotes/{$quoteId}")->assertOk()->assertJsonPath('quote.status', 'viewed');

        $accept = $this->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk();
        $orderId = $accept->json('order.id');

        $this->assertSame('accepted', Quote::find($quoteId)->status);
        $this->assertSame('won', Lead::find($lead->id)->status);
        $order = Order::find($orderId);
        $this->assertSame(Order::STATUS_PENDING_PAYMENT, $order->status);
        $this->assertSame('30000.00', (string) $order->total);
        $this->assertSame('12000.00', (string) $order->deposit_amount); // 40%
    }

    public function test_sent_quote_cannot_be_edited(): void
    {
        User::factory()->admin()->create();
        $admin = User::factory()->admin()->create();
        $lead = Lead::factory()->create();
        $quote = Quote::factory()->sent()->create(['lead_id' => $lead->id]);

        $this->actingAs($admin, 'sanctum');
        $this->postJson("/api/v1/admin/quotes/{$quote->id}/items", [
            'label' => 'X', 'unit_price' => 100,
        ])->assertStatus(422);
    }

    public function test_admin_can_create_a_new_version_for_negotiation(): void
    {
        $admin = User::factory()->admin()->create();
        $lead = Lead::factory()->create();
        $quote = Quote::factory()->sent()->create(['lead_id' => $lead->id, 'version' => 1]);
        $quote->items()->create(['label' => 'A', 'unit_price' => 5000, 'quantity' => 1, 'total' => 5000]);

        $this->actingAs($admin, 'sanctum');
        $res = $this->postJson("/api/v1/admin/quotes/{$quote->id}/version")->assertCreated();

        $this->assertSame(2, $res->json('quote.version'));
        $this->assertSame('draft', $res->json('quote.status'));
        $this->assertCount(1, $res->json('quote.items'));
    }

    public function test_user_cannot_accept_another_users_quote(): void
    {
        $other = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $other->id]);
        $quote = Quote::factory()->sent()->create(['lead_id' => $lead->id]);

        $this->actingAsRole('user');
        $this->postJson("/api/v1/quotes/{$quote->id}/accept")->assertStatus(403);
    }
}
