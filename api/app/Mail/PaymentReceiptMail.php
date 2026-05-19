<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceiptMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✅ إيصال الدفع — ' . number_format((float)$this->payment->amount) . ' ' . $this->payment->currency,
        );
    }

    public function content(): Content
    {
        $invoiceUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'))
            . '/dashboard/invoices/' . $this->payment->invoice_id;

        return new Content(
            markdown: 'emails.payment-receipt',
            with: [
                'payment' => $this->payment,
                'invoice' => $this->payment->invoice,
                'user' => $this->payment->user,
                'invoiceUrl' => $invoiceUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
