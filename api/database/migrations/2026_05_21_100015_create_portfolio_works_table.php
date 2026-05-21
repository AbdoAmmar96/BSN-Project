<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_works', function (Blueprint $table) {
            $table->id();
            $table->string('title');                 // company / project name (EN or AR)
            $table->string('company_ar')->nullable(); // Arabic company name shown under the card
            $table->string('url');                    // live site link
            $table->string('tag')->nullable();        // e.g. "موقع · كيماويات"
            $table->text('description')->nullable();
            $table->json('tech')->nullable();         // tags like ["React", "Laravel"]
            $table->enum('category', ['web', 'ecommerce'])->default('web');
            $table->string('image_path')->nullable(); // uploaded screenshot; null → auto mShots
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_works');
    }
};
