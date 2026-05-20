<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Projects created from a paid order start at `pending_assignment` until an
 * admin reviews and assigns a developer (Flow E). MySQL needs an explicit enum
 * MODIFY; SQLite (used in tests) stores enums as TEXT with a CHECK and is
 * rebuilt by the test suite, so we only touch MySQL here.
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE projects MODIFY COLUMN status ENUM(
            'draft','pending','pending_assignment','quoted','approved',
            'in_progress','review','revision','completed','cancelled','on_hold'
        ) NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE projects MODIFY COLUMN status ENUM(
            'draft','pending','quoted','approved',
            'in_progress','review','revision','completed','cancelled','on_hold'
        ) NOT NULL DEFAULT 'draft'");
    }
};
