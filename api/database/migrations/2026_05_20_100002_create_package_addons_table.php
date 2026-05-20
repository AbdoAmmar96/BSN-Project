<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Optional extras a client can stack on top of a package during checkout
 * (e.g. "English version +30%", "Blog +3,500 EGP"). Price is either a fixed
 * amount or a percentage of the package price.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('package_addons', function (Blueprint $table) {
            $table->id();
            $table->enum('service_type', ['web', 'ecommerce', 'branding', 'marketing', 'any']);
            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->enum('price_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('price_egp', 12, 2)->default(0);   // used when price_type = fixed
            $table->decimal('price_sar', 12, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();   // used when price_type = percentage (e.g. 30.00)
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['service_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_addons');
    }
};
