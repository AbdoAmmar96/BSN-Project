<?php

namespace App\Console\Commands;

use App\Mail\InvoiceReminderMail;
use App\Models\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendInvoiceReminders extends Command
{
    protected $signature = 'invoices:send-reminders {--days=3 : Send reminders for invoices due in N days}';

    protected $description = 'Email a reminder to clients for unpaid invoices due in N days';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $target = now()->addDays($days)->startOfDay();
        $end = (clone $target)->endOfDay();

        $invoices = Invoice::with('user')
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->whereBetween('due_at', [$target, $end])
            ->whereNotNull('user_id')
            ->get();

        $this->info("Found {$invoices->count()} invoice(s) due in {$days} days.");

        foreach ($invoices as $invoice) {
            if (!$invoice->user?->email) {
                continue;
            }
            Mail::to($invoice->user->email)->send(new InvoiceReminderMail($invoice, $days));
            $this->line("→ reminder sent for invoice #{$invoice->id} to {$invoice->user->email}");
        }

        return self::SUCCESS;
    }
}
