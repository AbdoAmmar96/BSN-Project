<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Optional 3-step onboarding answers captured right after email verification.
 * One row per user.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_onboarding', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('looking_for', ['web', 'ecommerce', 'branding', 'marketing', 'browsing'])->nullable();
            $table->string('company_name')->nullable();
            $table->enum('team_size', ['just_me', '2-5', '6-20', '20+'])->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_onboarding');
    }
};
