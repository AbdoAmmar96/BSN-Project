<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentUpdateNotification extends Notification
{
    use Queueable;

    /**
     * $event one of: invoice.created, invoice.updated, payment.success,
     * payment.failed, payment.refunded
     */
    public function __construct(
        public string $event,
        public string $title,
        public string $body,
        public array $context = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => $this->event,
            'title' => $this->title,
            'body' => $this->body,
            ...$this->context,
        ];
    }
}
