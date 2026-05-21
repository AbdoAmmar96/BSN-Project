<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Quote;
use App\Support\ReferenceNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    /** GET /api/v1/admin/leads — the leads queue, newest first, filterable. */
    public function index(Request $request): JsonResponse
    {
        $query = Lead::query()
            // Qualify columns: latestOfMany() self-joins the quotes table, so an
            // unqualified `lead_id` in the select is ambiguous on MySQL.
            ->with(['user:id,name,email', 'assignedAdmin:id,name', 'latestQuote:quotes.id,quotes.lead_id,quotes.status,quotes.total,quotes.version'])
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($service = $request->query('service_type')) {
            $query->where('service_type', $service);
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    public function show(Lead $lead): JsonResponse
    {
        return response()->json([
            'lead' => $lead->load([
                'user:id,name,email,phone,company',
                'assignedAdmin:id,name',
                'quotes' => fn ($q) => $q->latest('version'),
                'quotes.items',
            ]),
        ]);
    }

    /** POST /api/v1/admin/leads/{lead}/assign — assign the acting admin. */
    public function assign(Request $request, Lead $lead): JsonResponse
    {
        $lead->update([
            'assigned_admin_id' => $request->user()->id,
            'status' => $lead->status === Lead::STATUS_NEW ? Lead::STATUS_REVIEWING : $lead->status,
        ]);

        return response()->json(['lead' => $lead->fresh('assignedAdmin')]);
    }

    /**
     * POST /api/v1/admin/leads/{lead}/quote — create a draft quote (v1) for the
     * lead, optionally seeded with line items. Returns the new quote.
     */
    public function buildQuote(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'currency' => 'sometimes|in:EGP,SAR',
            'estimated_days' => 'sometimes|nullable|integer|min:1',
            'terms' => 'sometimes|nullable|string|max:5000',
            'items' => 'sometimes|array',
            'items.*.label' => 'required_with:items|string|max:200',
            'items.*.description' => 'sometimes|nullable|string|max:1000',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.quantity' => 'sometimes|integer|min:1',
        ]);

        $quote = DB::transaction(function () use ($lead, $data) {
            $version = ((int) $lead->quotes()->max('version')) + 1;

            $quote = Quote::create([
                'quote_number' => ReferenceNumber::next('quotes', 'quote_number', 'QT'),
                'lead_id' => $lead->id,
                'version' => $version,
                'status' => Quote::STATUS_DRAFT,
                'currency' => $data['currency'] ?? 'EGP',
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'estimated_days' => $data['estimated_days'] ?? null,
                'payment_schedule' => [
                    ['percentage' => 40, 'label' => 'عربون'],
                    ['percentage' => 30, 'label' => 'بعد التصميم'],
                    ['percentage' => 30, 'label' => 'عند التسليم'],
                ],
                'terms' => $data['terms'] ?? null,
                'expires_at' => now()->addDays(7),
            ]);

            foreach ($data['items'] ?? [] as $i => $item) {
                $qty = $item['quantity'] ?? 1;
                $quote->items()->create([
                    'label' => $item['label'],
                    'description' => $item['description'] ?? null,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $qty,
                    'total' => round($item['unit_price'] * $qty, 2),
                    'sort_order' => $i,
                ]);
            }

            $this->recalculate($quote);
            $lead->update(['status' => Lead::STATUS_REVIEWING]);

            return $quote;
        });

        return response()->json(['quote' => $quote->load('items')], 201);
    }

    public static function recalculate(Quote $quote): void
    {
        $subtotal = $quote->items()->sum('total');
        $total = max(0, $subtotal - (float) $quote->discount);
        $quote->update(['subtotal' => $subtotal, 'total' => $total]);
    }
}
