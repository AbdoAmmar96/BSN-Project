<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The addons chosen for an order, with a price snapshot taken at order time
 * (so later price changes don't rewrite history).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('order_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_addon_id')->constrained();
            $table->decimal('price', 12, 2); // resolved price snapshot at order time
            $table->timestamps();

            $table->unique(['order_id', 'package_addon_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_addons');
    }
};
