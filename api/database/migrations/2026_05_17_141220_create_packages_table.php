<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->enum('service_type', ['web', 'ecommerce', 'branding', 'marketing']);
            $table->string('name');                 // "Landing Page"
            $table->decimal('price', 12, 2);        // 8500.00
            $table->string('currency', 8)->default('EGP');
            $table->string('price_prefix')->nullable();  // "من" أو null
            $table->string('period')->nullable();        // "/شهر" أو null
            $table->string('note')->nullable();          // وصف قصير
            $table->json('features')->nullable();        // ["تصميم مخصص", ...]
            $table->boolean('featured')->default(false);
            $table->string('ribbon')->nullable();        // "الأكتر طلباً"
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['service_type', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
