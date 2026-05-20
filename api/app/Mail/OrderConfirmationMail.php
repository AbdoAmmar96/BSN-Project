<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✅ تأكيد طلبك — ' . $this->order->order_number,
        );
    }

    public function content(): Content
    {
        $orderUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'))
            . '/dashboard/orders/' . $this->order->id;

        return new Content(
            markdown: 'emails.order-confirmation',
            with: [
                'order' => $this->order,
                'user' => $this->order->user,
                'orderUrl' => $orderUrl,
            ],
        );
    }
}
