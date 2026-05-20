<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-built quotes for a lead (Path B). Versioned so negotiation produces
 * v2/v3. quote_items are the line items. When accepted, an order is created
 * and linked back via order_id.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique();   // BSN-QT-2026-0001
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->integer('version')->default(1);
            $table->enum('status', ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'])->default('draft');
            $table->enum('currency', ['EGP', 'SAR'])->default('EGP');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->integer('estimated_days')->nullable();
            $table->json('payment_schedule')->nullable(); // [{percentage:40,label:"عربون"},...]
            $table->text('terms')->nullable();
            $table->foreignId('order_id')->nullable()->constrained(); // set when accepted
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['lead_id', 'version']);
            $table->index('status');
        });

        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            $table->string('label');                 // "Design (3 صفحات)"
            $table->text('description')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->integer('quantity')->default(1);
            $table->decimal('total', 12, 2);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_items');
        Schema::dropIfExists('quotes');
    }
};
