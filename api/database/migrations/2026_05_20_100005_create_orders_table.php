<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Path A purchases. An order captures the priced cart (package + addons +
 * coupon), the project brief, and — after payment — links to the generated
 * invoice + project. Assignment columns power Flow E (admin review).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();                 // BSN-ORD-2026-0001
            $table->foreignId('user_id')->constrained();
            $table->foreignId('package_id')->nullable()->constrained();
            $table->foreignId('bundle_id')->nullable()->constrained();
            $table->foreignId('coupon_id')->nullable()->constrained();
            $table->enum('status', [
                'draft', 'pending_payment', 'paid', 'in_progress',
                'completed', 'cancelled', 'refunded',
            ])->default('draft');

            // Pricing breakdown
            $table->enum('currency', ['EGP', 'SAR'])->default('EGP');
            $table->decimal('package_price', 12, 2)->default(0);
            $table->decimal('addons_total', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('deposit_amount', 12, 2)->default(0);     // 40% of total
            $table->decimal('remaining_amount', 12, 2)->default(0);

            // Project details
            $table->string('project_name')->nullable();
            $table->text('description')->nullable();
            $table->date('expected_launch_date')->nullable();

            // Links
            $table->foreignId('invoice_id')->nullable()->constrained();
            $table->foreignId('project_id')->nullable()->constrained();

            // Tracking + assignment (Flow E)
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('assigned_developer_id')->nullable()->constrained('users');
            $table->foreignId('assigned_by_admin_id')->nullable()->constrained('users');
            $table->timestamp('developer_assigned_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
