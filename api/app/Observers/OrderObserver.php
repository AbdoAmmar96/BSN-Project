<?php

namespace App\Observers;

use App\Models\ChatRoom;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Project;
use App\Models\User;
use App\Mail\OrderConfirmationMail;
use App\Notifications\PaymentUpdateNotification;
use App\Support\ReferenceNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Fulfilment side-effects when an order transitions to `paid` (Path A after
 * payment, or Path B after the deposit on an accepted quote):
 *   - generate the invoice
 *   - create the project at `pending_assignment` (NOT active — see Flow E)
 *   - open the project chat room (client + admins)
 *   - notify admins that the order needs review/assignment
 *   - email the client a receipt
 *
 * The project only becomes `active` once an admin assigns a developer in
 * Phase 3.5. This observer is idempotent: it does nothing if the order already
 * has a linked project.
 */
class OrderObserver
{
    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status')) {
            return;
        }
        if ($order->status !== Order::STATUS_PAID) {
            return;
        }
        if ($order->project_id !== null) {
            return; // already fulfilled
        }

        DB::transaction(function () use ($order) {
            // Project first — invoices.project_id is NOT NULL.
            $project = $this->createProject($order);
            $invoice = $this->createInvoice($order, $project);
            $this->createChatRoom($order, $project);

            $order->forceFill([
                'invoice_id' => $invoice->id,
                'project_id' => $project->id,
                'paid_at' => $order->paid_at ?? now(),
            ])->saveQuietly();

            // Link the deposit payment(s) to the freshly created invoice/project
            // so the invoice can report how much was paid vs. what's left. The
            // payment(s) were made against the order before the invoice existed.
            $order->payments()->update([
                'invoice_id' => $invoice->id,
                'project_id' => $project->id,
            ]);
            $this->syncInvoiceStatus($invoice);
        });

        $this->notifyAdmins($order);
        $this->notifyClient($order);
    }

    /** Recompute invoice status from its completed payments. */
    private function syncInvoiceStatus(Invoice $invoice): void
    {
        $paid = $invoice->payments()->where('status', 'completed')->sum('amount');
        $invoice->update([
            'status' => $paid >= (float) $invoice->total ? 'paid' : 'partial',
        ]);
    }

    private function createProject(Order $order): Project
    {
        return Project::create([
            'client_id' => $order->user_id,
            'title' => $order->project_name ?: ('طلب ' . $order->order_number),
            'slug' => Str::slug($order->project_name ?: $order->order_number) . '-' . Str::lower(Str::random(6)),
            'description' => $order->description,
            'service_type' => $order->package?->service_type ?? 'other',
            'status' => 'pending_assignment',
            'budget' => $order->total,
            'currency' => $order->currency,
            'paid_amount' => $order->deposit_amount,
            'meta' => ['order_number' => $order->order_number],
        ]);
    }

    private function createInvoice(Order $order, Project $project): Invoice
    {
        return Invoice::create([
            'invoice_number' => ReferenceNumber::next('invoices', 'invoice_number', 'INV'),
            'project_id' => $project->id,
            'user_id' => $order->user_id,
            'subtotal' => $order->subtotal,
            'tax' => 0,
            'discount' => $order->discount,
            'total' => $order->total,
            'currency' => $order->currency,
            'status' => 'partial', // deposit paid, balance remaining
            'issued_at' => now(),
            'items' => $this->invoiceItems($order),
        ]);
    }

    private function createChatRoom(Order $order, Project $project): void
    {
        $room = ChatRoom::firstOrCreate(
            ['project_id' => $project->id, 'type' => 'project'],
            ['name' => $project->title, 'created_by' => $order->user_id, 'last_message_at' => now()],
        );

        // Client + all admins join. Developer is added later on assignment.
        $memberIds = collect([$order->user_id])
            ->concat(User::where('role', 'admin')->pluck('id'))
            ->unique()
            ->all();

        foreach ($memberIds as $uid) {
            $room->users()->syncWithoutDetaching([
                $uid => ['role' => 'member', 'joined_at' => now()],
            ]);
        }
    }

    private function notifyAdmins(Order $order): void
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new PaymentUpdateNotification(
                'order.needs_review',
                'طلب جديد محتاج مراجعة',
                "الطلب {$order->order_number} اتدفع ومحتاج تعيين developer.",
                ['order_id' => $order->id, 'url' => '/admin/orders/' . $order->id],
            ));
        }
    }

    private function notifyClient(Order $order): void
    {
        $user = $order->user;
        if (! $user) {
            return;
        }

        $user->notify(new PaymentUpdateNotification(
            'order.paid',
            'تم استلام طلبك',
            "طلبك {$order->order_number} وصلنا. هنراجعه ونعيّن الفريق خلال 24 ساعة.",
            ['order_id' => $order->id, 'url' => '/dashboard/orders/' . $order->id],
        ));

        // Order-confirmation receipt email (queued).
        Mail::to($user->email)->send(new OrderConfirmationMail($order));
    }

    private function invoiceItems(Order $order): array
    {
        $items = [[
            'label' => $order->package?->name ?? 'باقة',
            'amount' => (float) $order->package_price,
        ]];

        foreach ($order->addons()->with('addon')->get() as $line) {
            $items[] = ['label' => $line->addon?->name_ar ?? 'إضافة', 'amount' => (float) $line->price];
        }

        return $items;
    }
}
