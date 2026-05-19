<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Invoice $invoice, public int $daysUntilDue) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⏰ تذكير: فاتورة #' . $this->invoice->id . ' مستحقة خلال ' . $this->daysUntilDue . ' أيام',
        );
    }

    public function content(): Content
    {
        $invoiceUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'))
            . '/dashboard/invoices/' . $this->invoice->id;

        return new Content(
            markdown: 'emails.invoice-reminder',
            with: [
                'invoice' => $this->invoice,
                'user' => $this->invoice->user,
                'daysUntilDue' => $this->daysUntilDue,
                'invoiceUrl' => $invoiceUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
