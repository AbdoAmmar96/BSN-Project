<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use App\Notifications\PaymentUpdateNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * GET /api/invoices — scoped by role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Invoice::with(['project:id,title,slug', 'user:id,name,email,company'])
            ->withCount('payments')
            ->latest();

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    /**
     * POST /api/invoices — admin only.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) abort(403);

        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'issued_at' => 'nullable|date',
            'due_at' => 'nullable|date|after_or_equal:issued_at',
            'notes' => 'nullable|string|max:2000',
        ]);

        $subtotal = collect($data['items'])->sum(fn($i) => $i['quantity'] * $i['price']);
        $total = $subtotal + ($data['tax'] ?? 0) - ($data['discount'] ?? 0);

        $invoice = Invoice::create([
            ...$data,
            'subtotal' => $subtotal,
            'tax' => $data['tax'] ?? 0,
            'discount' => $data['discount'] ?? 0,
            'total' => $total,
            'currency' => $data['currency'] ?? 'EGP',
            'status' => 'draft',
        ]);

        if ($client = User::find($invoice->user_id)) {
            $client->notify(new PaymentUpdateNotification(
                'invoice.created',
                'فاتورة جديدة #' . $invoice->id,
                "المبلغ: {$invoice->total} {$invoice->currency}",
                ['invoice_id' => $invoice->id, 'url' => '/dashboard/invoices/' . $invoice->id],
            ));
        }

        return response()->json([
            'message' => 'تم إنشاء الفاتورة',
            'invoice' => $invoice->load(['project', 'user']),
        ], 201);
    }

    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $invoice->user_id !== $user->id) abort(403);

        $invoice->load(['project', 'user', 'payments']);
        return response()->json(['invoice' => $invoice]);
    }

    /**
     * PUT /api/invoices/{invoice} — update status (admin only).
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        if (!$request->user()->isAdmin()) abort(403);

        $data = $request->validate([
            'status' => 'sometimes|in:draft,sent,partial,paid,overdue,cancelled',
            'notes' => 'sometimes|nullable|string|max:2000',
            'due_at' => 'sometimes|nullable|date',
        ]);

        $oldStatus = $invoice->status;
        $invoice->update($data);

        if (isset($data['status']) && $data['status'] !== $oldStatus) {
            $statusLabels = [
                'draft' => 'مسودة', 'sent' => 'مُرسلة', 'partial' => 'مدفوعة جزئياً',
                'paid' => 'مدفوعة', 'overdue' => 'متأخرة', 'cancelled' => 'ملغية',
            ];
            $label = $statusLabels[$data['status']] ?? $data['status'];
            if ($client = User::find($invoice->user_id)) {
                $client->notify(new PaymentUpdateNotification(
                    'invoice.updated',
                    'تحديث فاتورة #' . $invoice->id,
                    "الحالة الجديدة: {$label} · المبلغ: {$invoice->total} {$invoice->currency}",
                    ['invoice_id' => $invoice->id, 'status' => $data['status'], 'url' => '/dashboard/invoices/' . $invoice->id],
                ));
            }
        }

        return response()->json(['message' => 'تم التحديث', 'invoice' => $invoice]);
    }

    /**
     * GET /api/invoices/{invoice}/pdf — stream the invoice as a PDF.
     */
    public function downloadPdf(Request $request, Invoice $invoice)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $invoice->user_id !== $user->id) abort(403);

        $invoice->load(['project', 'user']);

        $html = view('invoices.pdf', ['invoice' => $invoice])->render();

        // mpdf handles Arabic shaping (letter joining) + RTL natively, which
        // DomPDF does not. tempDir must be writable.
        $tempDir = storage_path('app/mpdf');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }

        $mpdf = new \Mpdf\Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'tempDir' => $tempDir,
            'autoScriptToLang' => true,
            'autoLangToFont' => true,
            'default_font' => 'dejavusans',
        ]);
        $mpdf->SetDirectionality('rtl');
        $mpdf->WriteHTML($html);

        $filename = ($invoice->invoice_number ?? ('invoice-' . $invoice->id)) . '.pdf';

        return response($mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function destroy(Request $request, Invoice $invoice): JsonResponse
    {
        if (!$request->user()->isAdmin()) abort(403);
        $invoice->delete();
        return response()->json(['message' => 'تم الحذف']);
    }

    /**
     * GET /api/admin/overview-stats — top-level dashboard stats.
     */
    public function overviewStats(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) abort(403);

        return response()->json([
            'users' => [
                'total' => User::count(),
                'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                'by_role' => [
                    'admin' => User::where('role', 'admin')->count(),
                    'developer' => User::where('role', 'developer')->count(),
                    'user' => User::where('role', 'user')->count(),
                ],
            ],
            'projects' => [
                'total' => Project::count(),
                'in_progress' => Project::where('status', 'in_progress')->count(),
                'completed' => Project::where('status', 'completed')->count(),
                'pending' => Project::where('status', 'pending')->count(),
            ],
            'revenue' => [
                'total' => \App\Models\Payment::where('status', 'completed')->sum('amount'),
                'this_month' => \App\Models\Payment::where('status', 'completed')
                    ->where('paid_at', '>=', now()->startOfMonth())->sum('amount'),
                'pending' => Invoice::whereIn('status', ['sent', 'partial', 'overdue'])->sum('total'),
            ],
            'orders' => [
                'total' => \App\Models\Order::count(),
                'this_month' => \App\Models\Order::where('created_at', '>=', now()->startOfMonth())->count(),
                // Paid orders still waiting on a developer assignment (Flow E queue).
                'needs_assignment' => \App\Models\Order::where('status', \App\Models\Order::STATUS_PAID)
                    ->whereNull('developer_assigned_at')->count(),
            ],
            'leads' => [
                'total' => \App\Models\Lead::count(),
                // Open leads in the sales pipeline (not yet won/lost/archived).
                'open' => \App\Models\Lead::whereIn('status', [
                    \App\Models\Lead::STATUS_NEW,
                    \App\Models\Lead::STATUS_REVIEWING,
                    \App\Models\Lead::STATUS_QUOTED,
                ])->count(),
            ],
        ]);
    }
}
