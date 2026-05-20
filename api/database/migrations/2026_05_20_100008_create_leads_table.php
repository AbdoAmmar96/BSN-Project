<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Path B custom-project requests, before a quote is built. smart_answers holds
 * the wizard Q&A keyed by question id.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('lead_number')->unique();   // BSN-LEAD-2026-0001
            $table->foreignId('user_id')->constrained();
            $table->enum('service_type', ['web', 'ecommerce', 'branding', 'marketing', 'other']);
            $table->enum('status', ['new', 'reviewing', 'quoted', 'won', 'lost', 'archived'])->default('new');
            $table->string('title');
            $table->text('description');
            $table->json('smart_answers')->nullable();
            $table->decimal('budget_min_egp', 12, 2)->nullable();
            $table->decimal('budget_max_egp', 12, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->foreignId('assigned_admin_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['status', 'service_type']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
