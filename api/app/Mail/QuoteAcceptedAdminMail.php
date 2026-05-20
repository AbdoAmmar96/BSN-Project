<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteAcceptedAdminMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Quote $quote, public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 العميل قبل عرض السعر — ' . $this->quote->quote_number,
        );
    }

    public function content(): Content
    {
        $adminUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'))
            . '/admin/orders/' . $this->order->id;

        return new Content(
            markdown: 'emails.quote-accepted-admin',
            with: [
                'quote' => $this->quote,
                'order' => $this->order,
                'lead' => $this->quote->lead,
                'client' => $this->quote->lead?->user,
                'adminUrl' => $adminUrl,
            ],
        );
    }
}
