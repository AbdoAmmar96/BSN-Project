<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Quote;
use App\Notifications\PaymentUpdateNotification;
use App\Support\ReferenceNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Quote::query()
            ->with('lead:id,lead_number,title,user_id', 'lead.user:id,name')
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    public function show(Quote $quote): JsonResponse
    {
        return response()->json(['quote' => $quote->load('items', 'lead.user:id,name,email')]);
    }

    /** PUT /api/v1/admin/quotes/{quote} — edit draft meta (currency, days, terms, discount). */
    public function update(Request $request, Quote $quote): JsonResponse
    {
        $this->assertDraft($quote);

        $data = $request->validate([
            'currency' => 'sometimes|in:EGP,SAR',
            'estimated_days' => 'sometimes|nullable|integer|min:1',
            'terms' => 'sometimes|nullable|string|max:5000',
            'discount' => 'sometimes|numeric|min:0',
            'payment_schedule' => 'sometimes|array',
        ]);

        $quote->update($data);
        LeadController::recalculate($quote);

        return response()->json(['quote' => $quote->fresh('items')]);
    }

    /** POST /api/v1/admin/quotes/{quote}/items — add a line item. */
    public function addItem(Request $request, Quote $quote): JsonResponse
    {
        $this->assertDraft($quote);

        $data = $request->validate([
            'label' => 'required|string|max:200',
            'description' => 'sometimes|nullable|string|max:1000',
            'unit_price' => 'required|numeric|min:0',
            'quantity' => 'sometimes|integer|min:1',
        ]);

        $qty = $data['quantity'] ?? 1;
        $quote->items()->create([
            'label' => $data['label'],
            'description' => $data['description'] ?? null,
            'unit_price' => $data['unit_price'],
            'quantity' => $qty,
            'total' => round($data['unit_price'] * $qty, 2),
            'sort_order' => (int) $quote->items()->max('sort_order') + 1,
        ]);

        LeadController::recalculate($quote);

        return response()->json(['quote' => $quote->fresh('items')], 201);
    }

    /** DELETE /api/v1/admin/quotes/{quote}/items/{item} */
    public function removeItem(Quote $quote, int $item): JsonResponse
    {
        $this->assertDraft($quote);

        $quote->items()->whereKey($item)->delete();
        LeadController::recalculate($quote);

        return response()->json(['quote' => $quote->fresh('items')]);
    }

    /**
     * POST /api/v1/admin/quotes/{quote}/send — send the quote to the client.
     * Transitions draft→sent and notifies the client.
     */
    public function send(Quote $quote): JsonResponse
    {
        $this->assertDraft($quote);

        if ($quote->items()->count() === 0) {
            return response()->json(['message' => 'أضف بنود قبل الإرسال.'], 422);
        }

        $quote->update([
            'status' => Quote::STATUS_SENT,
            'sent_at' => now(),
            'expires_at' => $quote->expires_at ?? now()->addDays(7),
        ]);
        $quote->lead->update(['status' => Lead::STATUS_QUOTED]);

        $client = $quote->lead->user;
        $client?->notify(new PaymentUpdateNotification(
            'quote.sent',
            'وصلك عرض سعر',
            "جهّزنالك عرض سعر للمشروع {$quote->lead->title}.",
            ['quote_id' => $quote->id, 'url' => '/dashboard/quotes/' . $quote->id],
        ));
        if ($client) {
            \Illuminate\Support\Facades\Mail::to($client->email)->send(new \App\Mail\QuoteReceivedMail($quote));
        }

        return response()->json(['quote' => $quote->fresh('items')]);
    }

    /**
     * POST /api/v1/admin/quotes/{quote}/version — clone the quote into a new
     * draft version for negotiation (v2, v3, ...).
     */
    public function createVersion(Quote $quote): JsonResponse
    {
        $new = DB::transaction(function () use ($quote) {
            $version = ((int) $quote->lead->quotes()->max('version')) + 1;

            $clone = Quote::create([
                'quote_number' => ReferenceNumber::next('quotes', 'quote_number', 'QT'),
                'lead_id' => $quote->lead_id,
                'version' => $version,
                'status' => Quote::STATUS_DRAFT,
                'currency' => $quote->currency,
                'subtotal' => $quote->subtotal,
                'discount' => $quote->discount,
                'total' => $quote->total,
                'estimated_days' => $quote->estimated_days,
                'payment_schedule' => $quote->payment_schedule,
                'terms' => $quote->terms,
                'expires_at' => now()->addDays(7),
            ]);

            foreach ($quote->items as $item) {
                $clone->items()->create($item->only(['label', 'description', 'unit_price', 'quantity', 'total', 'sort_order']));
            }

            return $clone;
        });

        return response()->json(['quote' => $new->load('items')], 201);
    }

    private function assertDraft(Quote $quote): void
    {
        abort_unless($quote->status === Quote::STATUS_DRAFT, 422, 'لا يمكن تعديل عرض بعد إرساله. أنشئ نسخة جديدة.');
    }
}
