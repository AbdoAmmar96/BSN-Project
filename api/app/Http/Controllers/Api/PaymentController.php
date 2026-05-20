<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Project;
use App\Services\Payment\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(protected PaymentManager $manager) {}

    /**
     * GET /api/payments — list payments for the current user (scoped by role).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Payment::query()->latest();

        if ($user->isUser()) {
            $query->where('user_id', $user->id);
        }
        // Admins & Devs see all

        return response()->json([
            'data' => $query->paginate(20),
        ]);
    }

    /**
     * POST /api/payments/initiate — start a payment flow.
     *
     * Body:
     *   gateway: fawry | paymob_card | paymob_wallet | paymob_installments | kashier
     *   amount: 1000 (decimal)
     *   project_id (optional)
     *   invoice_id (optional)
     *   phone (required for paymob_wallet)
     *   months (required for paymob_installments)
     */
    public function initiate(Request $request): JsonResponse
    {
        // The mock gateway is dev-only — accepted only when explicitly enabled.
        $gateways = 'fawry,paymob_card,paymob_wallet,paymob_installments,kashier';
        if (config('services.mock_payments.enabled')) {
            $gateways .= ',mock';
        }

        $data = $request->validate([
            'gateway' => "required|in:{$gateways}",
            'amount' => 'required|numeric|min:1',
            'currency' => 'sometimes|string|size:3',
            'project_id' => 'nullable|exists:projects,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'order_id' => 'nullable|exists:orders,id',
            'phone' => 'nullable|string|max:20',
            'months' => 'nullable|integer|min:3|max:24',
        ]);

        // Ensure the user can pay for this invoice/project/order
        if (!empty($data['project_id'])) {
            $project = Project::findOrFail($data['project_id']);
            if (!$request->user()->isAdmin() && $project->client_id !== $request->user()->id) {
                return response()->json(['message' => 'لا يمكنك الدفع لمشروع غير مشروعك'], 403);
            }
        }
        if (!empty($data['invoice_id'])) {
            $invoice = Invoice::findOrFail($data['invoice_id']);
            if (!$request->user()->isAdmin() && $invoice->user_id !== $request->user()->id) {
                return response()->json(['message' => 'لا يمكنك الدفع لفاتورة غير فاتورتك'], 403);
            }
        }
        if (!empty($data['order_id'])) {
            $order = \App\Models\Order::findOrFail($data['order_id']);
            if (!$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
                return response()->json(['message' => 'لا يمكنك الدفع لطلب غير طلبك'], 403);
            }
        }

        $payment = Payment::create([
            'user_id' => $request->user()->id,
            'invoice_id' => $data['invoice_id'] ?? null,
            'project_id' => $data['project_id'] ?? null,
            'order_id' => $data['order_id'] ?? null,
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'EGP',
            'gateway' => $data['gateway'],
            'installment_months' => $data['months'] ?? null,
        ]);

        try {
            $result = $this->manager->initiate($payment, [
                'phone' => $data['phone'] ?? null,
                'months' => $data['months'] ?? null,
            ]);
        } catch (\Throwable $e) {
            $payment->markFailed($e->getMessage());
            return response()->json([
                'message' => 'فشل في بدء الدفع',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'payment' => $payment->fresh(),
            'checkout' => $result, // {type, data}
        ]);
    }

    /**
     * GET /api/payments/{payment} — show single payment status.
     */
    public function show(Request $request, Payment $payment): JsonResponse
    {
        if (!$request->user()->isAdmin() && $payment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['payment' => $payment]);
    }

    /**
     * POST /api/payments/{payment}/recheck — manually re-verify status with gateway.
     */
    public function recheck(Request $request, Payment $payment): JsonResponse
    {
        if (!$request->user()->isAdmin() && $payment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $service = $this->manager->for($payment);
        $newStatus = $service->checkStatus($payment);

        if ($newStatus !== $payment->status) {
            $payment->update(['status' => $newStatus]);
            if ($newStatus === Payment::STATUS_COMPLETED) {
                $payment->markCompleted([]);
            }
        }

        return response()->json(['payment' => $payment->fresh()]);
    }

    // ============================================
    // WEBHOOKS (public — no auth required)
    // ============================================

    public function paymobWebhook(Request $request): JsonResponse
    {
        $result = (new \App\Services\Payment\PaymobService())->handleWebhook($request);
        return response()->json($result);
    }

    public function fawryWebhook(Request $request): JsonResponse
    {
        $result = (new \App\Services\Payment\FawryService())->handleWebhook($request);
        return response()->json($result);
    }

    public function kashierWebhook(Request $request): JsonResponse
    {
        $result = (new \App\Services\Payment\KashierService())->handleWebhook($request);
        return response()->json($result);
    }
}
