<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\Order;
use App\Models\OrderAddon;
use App\Models\Package;
use App\Models\PackageAddon;
use App\Models\Project;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;
use App\Services\OrderPricing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo data that exercises the business model end-to-end so the admin
 * dashboards aren't empty after a fresh seed:
 *   - one PAID order awaiting developer assignment (lights up Flow E + KPI)
 *   - one in-progress order with a developer already assigned
 *   - one open lead with a draft quote (admin can keep building it)
 *   - one lead with a sent quote waiting on the client
 *
 * Idempotent: keyed on order/lead numbers so re-running won't duplicate.
 */
class BusinessModelDemoSeeder extends Seeder
{
    public function run(): void
    {
        $client = User::where('email', 'client@example.com')->first();
        $admin = User::where('email', 'amr@bp-eg.com')->first();
        $dev = User::where('email', 'dev@bp-eg.com')->first();
        $package = Package::where('service_type', 'web')->orderBy('id')->first();

        if (! $client || ! $package) {
            $this->command->warn('Skipping demo: base users/packages missing.');
            return;
        }

        $pricing = app(OrderPricing::class);
        $addon = PackageAddon::where('service_type', 'web')->where('is_active', true)->first();
        $addonIds = $addon ? [$addon->id] : [];

        $this->awaitingAssignmentOrder($client, $package, $addonIds, $pricing);
        $this->inProgressOrder($client, $admin, $dev, $package, $pricing);
        $this->openLeadWithDraftQuote($client);
        $this->leadWithSentQuote($client, $admin);

        $this->command->info('✓ Seeded demo orders, leads & quotes.');
    }

    private function awaitingAssignmentOrder(User $client, Package $package, array $addonIds, OrderPricing $pricing): void
    {
        $b = $pricing->breakdown($package, $addonIds);

        $order = Order::firstOrCreate(
            ['order_number' => 'BSN-ORD-DEMO-0001'],
            [
                'user_id' => $client->id,
                'package_id' => $package->id,
                'status' => Order::STATUS_PAID,
                'currency' => 'EGP',
                'package_price' => $b['package_price'],
                'addons_total' => $b['addons_total'],
                'subtotal' => $b['subtotal'],
                'discount' => $b['discount'],
                'total' => $b['total'],
                'deposit_amount' => $b['deposit_amount'],
                'remaining_amount' => $b['remaining_amount'],
                'project_name' => 'موقع شركة النور التعريفي',
                'description' => 'موقع تعريفي 5 صفحات بالعربي والإنجليزي.',
                'paid_at' => now()->subDay(),
            ],
        );

        foreach ($b['addon_lines'] as $line) {
            OrderAddon::firstOrCreate(
                ['order_id' => $order->id, 'package_addon_id' => $line['id']],
                ['price' => $line['price']],
            );
        }

        // Mirror what OrderObserver builds, minus the developer (that's the point).
        if (! $order->project_id) {
            $project = Project::create([
                'client_id' => $client->id,
                'title' => $order->project_name,
                'slug' => Str::slug($order->project_name) . '-' . Str::lower(Str::random(6)),
                'service_type' => 'web',
                'status' => 'pending_assignment',
                'budget' => $order->total,
                'currency' => 'EGP',
                'paid_amount' => $order->deposit_amount,
            ]);
            $order->forceFill(['project_id' => $project->id])->saveQuietly();
        }
    }

    private function inProgressOrder(User $client, ?User $admin, ?User $dev, Package $package, OrderPricing $pricing): void
    {
        $b = $pricing->breakdown($package, []);

        $order = Order::firstOrCreate(
            ['order_number' => 'BSN-ORD-DEMO-0002'],
            [
                'user_id' => $client->id,
                'package_id' => $package->id,
                'status' => Order::STATUS_IN_PROGRESS,
                'currency' => 'EGP',
                'package_price' => $b['package_price'],
                'addons_total' => 0,
                'subtotal' => $b['subtotal'],
                'discount' => 0,
                'total' => $b['total'],
                'deposit_amount' => $b['deposit_amount'],
                'remaining_amount' => $b['remaining_amount'],
                'project_name' => 'متجر إلكتروني للملابس',
                'description' => 'متجر بنظام دفع وشحن.',
                'paid_at' => now()->subDays(5),
                'assigned_developer_id' => $dev?->id,
                'assigned_by_admin_id' => $admin?->id,
                'developer_assigned_at' => now()->subDays(4),
            ],
        );

        if (! $order->project_id) {
            $project = Project::create([
                'client_id' => $client->id,
                'lead_developer_id' => $dev?->id,
                'title' => $order->project_name,
                'slug' => Str::slug($order->project_name) . '-' . Str::lower(Str::random(6)),
                'service_type' => 'web',
                'status' => 'in_progress',
                'progress' => 35,
                'budget' => $order->total,
                'currency' => 'EGP',
                'paid_amount' => $order->deposit_amount,
            ]);
            $order->forceFill(['project_id' => $project->id])->saveQuietly();
        }
    }

    private function openLeadWithDraftQuote(User $client): void
    {
        $lead = Lead::firstOrCreate(
            ['lead_number' => 'BSN-LEAD-DEMO-0001'],
            [
                'user_id' => $client->id,
                'service_type' => 'web',
                'status' => Lead::STATUS_REVIEWING,
                'title' => 'منصة تعليمية متكاملة',
                'description' => 'منصة كورسات بنظام اشتراكات ولوحة تحكم للمدرّسين.',
                'budget_min_egp' => 80000,
                'budget_max_egp' => 150000,
            ],
        );

        $quote = Quote::firstOrCreate(
            ['quote_number' => 'BSN-QT-DEMO-0001'],
            [
                'lead_id' => $lead->id,
                'version' => 1,
                'status' => Quote::STATUS_DRAFT,
                'currency' => 'EGP',
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'estimated_days' => 45,
            ],
        );

        if ($quote->items()->count() === 0) {
            QuoteItem::create(['quote_id' => $quote->id, 'label' => 'تصميم واجهات UI/UX', 'unit_price' => 25000, 'quantity' => 1, 'total' => 25000]);
            QuoteItem::create(['quote_id' => $quote->id, 'label' => 'تطوير الـ backend', 'unit_price' => 60000, 'quantity' => 1, 'total' => 60000]);
            $this->recalcQuote($quote);
        }
    }

    private function leadWithSentQuote(User $client, ?User $admin): void
    {
        $lead = Lead::firstOrCreate(
            ['lead_number' => 'BSN-LEAD-DEMO-0002'],
            [
                'user_id' => $client->id,
                'service_type' => 'branding',
                'status' => Lead::STATUS_QUOTED,
                'assigned_admin_id' => $admin?->id,
                'title' => 'هوية بصرية كاملة لمطعم',
                'description' => 'لوجو + دليل هوية + تصاميم سوشيال ميديا.',
                'budget_min_egp' => 20000,
                'budget_max_egp' => 40000,
            ],
        );

        $quote = Quote::firstOrCreate(
            ['quote_number' => 'BSN-QT-DEMO-0002'],
            [
                'lead_id' => $lead->id,
                'version' => 1,
                'status' => Quote::STATUS_SENT,
                'currency' => 'EGP',
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'estimated_days' => 21,
                'sent_at' => now()->subDays(2),
                'expires_at' => now()->addDays(5),
            ],
        );

        if ($quote->items()->count() === 0) {
            QuoteItem::create(['quote_id' => $quote->id, 'label' => 'تصميم اللوجو', 'unit_price' => 12000, 'quantity' => 1, 'total' => 12000]);
            QuoteItem::create(['quote_id' => $quote->id, 'label' => 'دليل الهوية البصرية', 'unit_price' => 18000, 'quantity' => 1, 'total' => 18000]);
            $this->recalcQuote($quote);
        }
    }

    private function recalcQuote(Quote $quote): void
    {
        $subtotal = (float) $quote->items()->sum('total');
        $quote->update([
            'subtotal' => $subtotal,
            'total' => round($subtotal - (float) $quote->discount, 2),
        ]);
    }
}
