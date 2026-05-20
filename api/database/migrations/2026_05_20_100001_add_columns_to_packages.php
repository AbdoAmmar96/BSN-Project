<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * Extend the existing packages table for the business-model launch:
 * SAR pricing, a declared delivery time, a unique slug for public detail
 * pages, and bilingual descriptions.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->decimal('price_sar', 12, 2)->nullable()->after('price');
            $table->unsignedSmallInteger('delivery_days')->nullable()->after('price_sar');
            $table->string('slug')->nullable()->after('name');
            $table->text('description_ar')->nullable()->after('note');
            $table->text('description_en')->nullable()->after('description_ar');
        });

        // Backfill slugs for any existing rows, then enforce uniqueness.
        foreach (DB::table('packages')->get() as $pkg) {
            DB::table('packages')->where('id', $pkg->id)->update([
                'slug' => Str::slug($pkg->name) . '-' . $pkg->id,
            ]);
        }

        Schema::table('packages', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['price_sar', 'delivery_days', 'slug', 'description_ar', 'description_en']);
        });
    }
};
