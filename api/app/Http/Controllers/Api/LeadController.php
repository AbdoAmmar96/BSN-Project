<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\PaymentUpdateNotification;
use App\Support\ReferenceNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    /** GET /api/v1/leads — the authenticated user's leads. */
    public function index(Request $request): JsonResponse
    {
        $leads = $request->user()->leads()
            ->with('latestQuote:id,lead_id,quote_number,status,total,version')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($leads);
    }

    /** GET /api/v1/leads/{lead} — show one (must own it). */
    public function show(Request $request, Lead $lead): JsonResponse
    {
        abort_unless($lead->user_id === $request->user()->id, 403, 'غير مصرح.');

        return response()->json([
            'lead' => $lead->load(['quotes' => fn ($q) => $q->latest('version'), 'quotes.items']),
        ]);
    }

    /**
     * POST /api/v1/leads — create a lead from the custom-quote wizard.
     * Notifies admins so they can review and build a quote.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'service_type' => 'required|in:web,ecommerce,branding,marketing,other',
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:5000',
            'smart_answers' => 'sometimes|array',
            'budget_min_egp' => 'sometimes|nullable|numeric|min:0',
            'budget_max_egp' => 'sometimes|nullable|numeric|min:0',
            'deadline' => 'sometimes|nullable|date',
        ]);

        $lead = DB::transaction(function () use ($request, $data) {
            return Lead::create([
                'lead_number' => ReferenceNumber::next('leads', 'lead_number', 'LEAD'),
                'user_id' => $request->user()->id,
                'service_type' => $data['service_type'],
                'status' => Lead::STATUS_NEW,
                'title' => $data['title'],
                'description' => $data['description'],
                'smart_answers' => $data['smart_answers'] ?? null,
                'budget_min_egp' => $data['budget_min_egp'] ?? null,
                'budget_max_egp' => $data['budget_max_egp'] ?? null,
                'deadline' => $data['deadline'] ?? null,
            ]);
        });

        foreach (User::where('role', 'admin')->get() as $admin) {
            $admin->notify(new PaymentUpdateNotification(
                'lead.created',
                'طلب عرض سعر جديد',
                "وصل طلب جديد {$lead->lead_number} محتاج مراجعة وبناء عرض.",
                ['lead_id' => $lead->id, 'url' => '/admin/leads/' . $lead->id],
            ));
        }

        return response()->json(['lead' => $lead], 201);
    }
}
