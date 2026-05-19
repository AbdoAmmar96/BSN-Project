<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Backfill indexes on columns the controllers filter / sort by but that didn't
 * get covered by the initial schema. Targets the queries reporting and listing
 * endpoints make today (invoices.due_at for reminder cron, *.created_at for
 * default-order listings, payments.paid_at for revenue reports).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->index('status', 'invoices_status_idx');
            $table->index('due_at', 'invoices_due_at_idx');
            $table->index('created_at', 'invoices_created_at_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('paid_at', 'payments_paid_at_idx');
            $table->index('created_at', 'payments_created_at_idx');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index('created_at', 'projects_created_at_idx');
        });

        Schema::table('packages', function (Blueprint $table) {
            $table->index('is_active', 'packages_is_active_idx');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_status_idx');
            $table->dropIndex('invoices_due_at_idx');
            $table->dropIndex('invoices_created_at_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_paid_at_idx');
            $table->dropIndex('payments_created_at_idx');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_created_at_idx');
        });

        Schema::table('packages', function (Blueprint $table) {
            $table->dropIndex('packages_is_active_idx');
        });
    }
};
