<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Quote;
use App\Models\User;
use App\Notifications\PaymentUpdateNotification;
use App\Support\ReferenceNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * User-side quote actions. Admins build quotes (Admin\QuoteController); here
 * the client views, accepts, rejects, or opens negotiation.
 */
class QuoteController extends Controller
{
    /** GET /api/v1/quotes — quotes addressed to the authenticated user. */
    public function index(Request $request): JsonResponse
    {
        $quotes = Quote::whereHas('lead', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with('lead:id,lead_number,title,service_type')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($quotes);
    }

    /** GET /api/v1/quotes/{quote} — show one; marks "sent" as "viewed". */
    public function show(Request $request, Quote $quote): JsonResponse
    {
        $this->authorizeOwner($request, $quote);

        if ($quote->status === Quote::STATUS_SENT) {
            $quote->update(['status' => Quote::STATUS_VIEWED, 'viewed_at' => now()]);
        }

        return response()->json([
            'quote' => $quote->load(['items', 'lead:id,lead_number,title,service_type']),
        ]);
    }

    /**
     * POST /api/v1/quotes/{quote}/accept — accept the quote, which creates a
     * draft Order (priced from the quote) the client then pays. Mirrors Path A
     * from the checkout step onward.
     */
    public function accept(Request $request, Quote $quote): JsonResponse
    {
        $this->authorizeOwner($request, $quote);

        if (! $quote->isAcceptable()) {
            return response()->json(['message' => 'لا يمكن قبول هذا العرض (منتهي أو غير متاح).'], 422);
        }

        $order = DB::transaction(function () use ($request, $quote) {
            $deposit = round((float) $quote->total * 0.4, 2);

            $order = Order::create([
                'order_number' => ReferenceNumber::next('orders', 'order_number', 'ORD'),
                'user_id' => $request->user()->id,
                'status' => Order::STATUS_PENDING_PAYMENT,
                'currency' => $quote->currency,
                'package_price' => $quote->subtotal,
                'addons_total' => 0,
                'subtotal' => $quote->subtotal,
                'discount' => $quote->discount,
                'total' => $quote->total,
                'deposit_amount' => $deposit,
                'remaining_amount' => round((float) $quote->total - $deposit, 2),
                'project_name' => $quote->lead->title,
                'description' => $quote->lead->description,
            ]);

            $quote->update(['status' => Quote::STATUS_ACCEPTED, 'order_id' => $order->id]);
            $quote->lead->update(['status' => Lead::STATUS_WON]);

            return $order;
        });

        // Tell admins the quote was accepted.
        foreach (User::where('role', 'admin')->get() as $admin) {
            $admin->notify(new PaymentUpdateNotification(
                'quote.accepted',
                'تم قبول عرض سعر',
                "العميل قبل العرض {$quote->quote_number}. في انتظار دفع العربون.",
                ['quote_id' => $quote->id, 'order_id' => $order->id, 'url' => '/admin/orders/' . $order->id],
            ));
            \Illuminate\Support\Facades\Mail::to($admin->email)->send(new \App\Mail\QuoteAcceptedAdminMail($quote, $order));
        }

        return response()->json([
            'message' => 'تم قبول العرض. ادفع العربون لبدء المشروع.',
            'order' => $order,
        ]);
    }

    /** POST /api/v1/quotes/{quote}/reject */
    public function reject(Request $request, Quote $quote): JsonResponse
    {
        $this->authorizeOwner($request, $quote);

        if (! in_array($quote->status, [Quote::STATUS_SENT, Quote::STATUS_VIEWED], true)) {
            return response()->json(['message' => 'لا يمكن رفض هذا العرض.'], 422);
        }

        $quote->update(['status' => Quote::STATUS_REJECTED]);
        $quote->lead->update(['status' => Lead::STATUS_LOST]);

        return response()->json(['message' => 'تم رفض العرض.']);
    }

    /**
     * POST /api/v1/quotes/{quote}/negotiate — flag for negotiation and let the
     * admin issue a new version. Returns the lead so the client can open chat.
     */
    public function negotiate(Request $request, Quote $quote): JsonResponse
    {
        $this->authorizeOwner($request, $quote);

        foreach (User::where('role', 'admin')->get() as $admin) {
            $admin->notify(new PaymentUpdateNotification(
                'quote.negotiate',
                'طلب تفاوض على عرض',
                "العميل عايز يتفاوض على العرض {$quote->quote_number}.",
                ['quote_id' => $quote->id, 'lead_id' => $quote->lead_id, 'url' => '/admin/leads/' . $quote->lead_id],
            ));
        }

        return response()->json([
            'message' => 'بعتنا طلبك لفريقنا. هنتواصل معاك للتفاوض.',
            'lead_id' => $quote->lead_id,
        ]);
    }

    private function authorizeOwner(Request $request, Quote $quote): void
    {
        abort_unless($quote->lead->user_id === $request->user()->id, 403, 'غير مصرح.');
    }
}
