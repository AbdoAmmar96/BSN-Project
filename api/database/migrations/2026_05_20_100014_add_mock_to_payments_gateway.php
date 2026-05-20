<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Add the dev-only `mock` gateway to payments.gateway. MySQL needs an explicit
 * enum MODIFY; SQLite (tests) stores enums as TEXT and is rebuilt per run, so we
 * only touch MySQL here.
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE payments MODIFY COLUMN gateway ENUM(
            'fawry','paymob_card','paymob_wallet','paymob_installments','kashier','manual','mock'
        ) NOT NULL");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE payments MODIFY COLUMN gateway ENUM(
            'fawry','paymob_card','paymob_wallet','paymob_installments','kashier','manual'
        ) NOT NULL");
    }
};
