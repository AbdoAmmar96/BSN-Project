<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Str;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(public Message $message) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $sender = $this->message->sender;
        $body = $this->message->type === 'text'
            ? \Illuminate\Support\Str::limit($this->message->body, 120)
            : ($this->message->type === 'image' ? '📷 صورة' : '📎 ملف');

        return [
            'kind' => 'chat.message',
            'title' => 'رسالة جديدة من ' . ($sender?->name ?? 'مستخدم'),
            'body' => $body,
            'room_id' => $this->message->chat_room_id,
            'message_id' => $this->message->id,
            'sender_id' => $sender?->id,
            'url' => '/dashboard/chat?room=' . $this->message->chat_room_id,
        ];
    }
}
