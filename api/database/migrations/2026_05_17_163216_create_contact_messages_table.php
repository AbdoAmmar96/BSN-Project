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
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 160);
            $table->string('phone', 32)->nullable();
            $table->string('subject', 200)->nullable();
            $table->text('message');
            $table->string('source', 60)->nullable();   // 'contact_page', 'service_web', ...
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->enum('status', ['new', 'replied', 'archived'])->default('new');
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
