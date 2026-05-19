<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Invoices — what we charge for
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // BSN-2026-0001
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // billed-to
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('currency', 3)->default('EGP');
            $table->enum('status', ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->date('issued_at')->nullable();
            $table->date('due_at')->nullable();
            $table->json('items')->nullable(); // line items
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        // Payments — actual money transactions
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // Our internal ref
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // payer

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('EGP');

            // Gateway info
            $table->enum('gateway', [
                'fawry',
                'paymob_card',
                'paymob_wallet',
                'paymob_installments',
                'kashier',
                'manual', // for cash/bank transfer
            ]);
            $table->string('gateway_transaction_id')->nullable()->index(); // ID from gateway
            $table->string('gateway_order_id')->nullable()->index();

            $table->enum('status', [
                'pending',     // initiated, awaiting gateway response
                'processing',  // user is at gateway checkout
                'completed',   // success
                'failed',      // gateway returned failure
                'cancelled',   // user cancelled
                'refunded',    // money returned
                'expired',     // for Fawry references that timed out
            ])->default('pending')->index();

            // Installment info (Paymob via Souhoola/ValU)
            $table->enum('installment_provider', ['souhoola', 'valu', 'aman', 'forsa'])->nullable();
            $table->integer('installment_months')->nullable();

            // Fawry reference number (the code user pays at any Fawry outlet)
            $table->string('fawry_reference')->nullable()->index();
            $table->timestamp('fawry_expires_at')->nullable();

            // Card last 4 (when applicable)
            $table->string('card_last4', 4)->nullable();
            $table->string('card_brand')->nullable(); // visa, mastercard, meeza

            // Webhook + raw data
            $table->json('gateway_response')->nullable(); // raw response
            $table->json('webhook_payload')->nullable();  // last webhook received
            $table->string('hmac_verified')->nullable(); // boolean as string for indexing

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['gateway', 'status']);
            $table->index('user_id');
        });

        // Refunds
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('reason')->nullable();
            $table->string('gateway_refund_id')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
    }
};
