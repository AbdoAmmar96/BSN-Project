<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Promo codes. Supports global usage caps, per-user caps, service scoping,
 * an optional max discount ceiling, and a validity window.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();                       // FIRST100, SUMMER2026
            $table->enum('discount_type', ['fixed', 'percentage'])->default('percentage');
            $table->decimal('discount_value', 12, 2);               // 10.00 (%) or 500 (EGP)
            $table->decimal('max_discount_egp', 12, 2)->nullable(); // ceiling for percentage coupons
            $table->unsignedInteger('usage_limit')->nullable();     // total redemptions allowed (null = unlimited)
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedInteger('per_user_limit')->default(1);
            $table->json('applies_to_services')->nullable();        // ["web","branding"] or null = all
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['code', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
