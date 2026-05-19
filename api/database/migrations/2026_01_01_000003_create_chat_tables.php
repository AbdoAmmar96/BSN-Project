<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Chat rooms (conversations)
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name')->nullable(); // For group chats
            $table->enum('type', ['direct', 'project', 'support', 'group'])->default('direct');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_message_at')->nullable()->index();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });

        // Participants in a chat room
        Schema::create('chat_room_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['member', 'admin'])->default('member');
            $table->timestamp('last_read_at')->nullable();
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('left_at')->nullable();
            $table->boolean('is_muted')->default(false);

            $table->unique(['chat_room_id', 'user_id']);
            $table->index('user_id');
        });

        // Messages
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // sender
            $table->foreignId('reply_to_id')->nullable()->constrained('messages')->nullOnDelete();

            $table->enum('type', ['text', 'file', 'image', 'system', 'voice'])->default('text');
            $table->text('body')->nullable();

            // For file/image messages
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_mime')->nullable();
            $table->bigInteger('attachment_size')->nullable();

            $table->json('meta')->nullable(); // for system messages

            $table->timestamp('edited_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();

            $table->index(['chat_room_id', 'created_at']);
        });

        // Read receipts (who has seen which message)
        Schema::create('message_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->useCurrent();

            $table->unique(['message_id', 'user_id']);
        });

        // Typing indicators (transient - can also be cached in Redis)
        Schema::create('typing_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('updated_at')->useCurrent();

            $table->unique(['chat_room_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_indicators');
        Schema::dropIfExists('message_reads');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('chat_room_users');
        Schema::dropIfExists('chat_rooms');
    }
};
