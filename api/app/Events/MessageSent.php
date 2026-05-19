<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    /**
     * Broadcast on the chat room's private channel.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("chat-room.{$this->message->chat_room_id}"),
        ];
    }

    /**
     * Event name — frontend listens to '.message.sent'
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * What gets sent in the broadcast payload.
     */
    public function broadcastWith(): array
    {
        $msg = $this->message->load('sender:id,name,avatar');

        return [
            'id' => $msg->id,
            'chat_room_id' => $msg->chat_room_id,
            'user_id' => $msg->user_id,
            'reply_to_id' => $msg->reply_to_id,
            'type' => $msg->type,
            'body' => $msg->body,
            'attachment_url' => $msg->attachment_url,
            'attachment_name' => $msg->attachment_name,
            'attachment_size' => $msg->attachment_size,
            'created_at' => $msg->created_at->toIso8601String(),
            'sender' => [
                'id' => $msg->sender->id,
                'name' => $msg->sender->name,
                'avatar' => $msg->sender->avatar,
            ],
        ];
    }
}
