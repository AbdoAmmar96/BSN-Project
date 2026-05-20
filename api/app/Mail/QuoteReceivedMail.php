<?php

namespace App\Mail;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Quote $quote) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📄 وصلك عرض سعر — ' . $this->quote->quote_number,
        );
    }

    public function content(): Content
    {
        $quoteUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'))
            . '/dashboard/quotes/' . $this->quote->id;

        return new Content(
            markdown: 'emails.quote-received',
            with: [
                'quote' => $this->quote,
                'lead' => $this->quote->lead,
                'user' => $this->quote->lead?->user,
                'quoteUrl' => $quoteUrl,
            ],
        );
    }
}
