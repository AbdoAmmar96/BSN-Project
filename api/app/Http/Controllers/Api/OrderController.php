<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Package;
use App\Rules\MeaningfulText;
use App\Services\OrderPricing;
use App\Support\ReferenceNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(private readonly OrderPricing $pricing) {}

    /** GET /api/v1/orders — the authenticated user's orders. */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with(['package:id,name,service_type', 'addons.addon:id,name_ar'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($orders);
    }

    /** GET /api/v1/orders/{order} — show one (must own it). */
    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        return response()->json([
            'order' => $order->load([
                'package', 'bundle', 'coupon', 'addons.addon', 'attachments', 'project:id,slug,status',
            ]),
        ]);
    }

    /**
     * POST /api/v1/orders — create a draft order for the wizard.
     * Pricing is always computed server-side from the package + addon ids.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $package = Package::findOrFail($data['package_id']);
        $coupon = $this->resolveCoupon($data['coupon_code'] ?? null);

        $b = $this->pricing->breakdown(
            $package,
            $data['addon_ids'] ?? [],
            $data['currency'] ?? 'EGP',
            $coupon,
            $request->user()->id,
        );

        $order = DB::transaction(function () use ($request, $data, $package, $coupon, $b) {
            $order = Order::create([
                'order_number' => ReferenceNumber::next('orders', 'order_number', 'ORD'),
                'user_id' => $request->user()->id,
                'package_id' => $package->id,
                'coupon_id' => ($b['coupon_error'] === null && $coupon) ? $coupon->id : null,
                'status' => Order::STATUS_DRAFT,
                'currency' => $data['currency'] ?? 'EGP',
                'package_price' => $b['package_price'],
                'addons_total' => $b['addons_total'],
                'subtotal' => $b['subtotal'],
                'discount' => $b['discount'],
                'total' => $b['total'],
                'deposit_amount' => $b['deposit_amount'],
                'remaining_amount' => $b['remaining_amount'],
                'project_name' => $data['project_name'] ?? null,
                'description' => $data['description'] ?? null,
                'expected_launch_date' => $data['expected_launch_date'] ?? null,
            ]);

            $this->syncAddons($order, $b['addon_lines']);

            return $order;
        });

        return response()->json([
            'order' => $order->load('addons.addon'),
            'coupon_error' => $b['coupon_error'],
        ], 201);
    }

    /** PUT /api/v1/orders/{order} — update a draft (re-prices). */
    public function update(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);
        if ($order->status !== Order::STATUS_DRAFT) {
            return response()->json(['message' => 'لا يمكن تعديل طلب بعد الدفع.'], 422);
        }

        $data = $this->validatePayload($request);
        $package = Package::findOrFail($data['package_id']);
        $coupon = $this->resolveCoupon($data['coupon_code'] ?? null);

        $b = $this->pricing->breakdown(
            $package,
            $data['addon_ids'] ?? [],
            $data['currency'] ?? $order->currency,
            $coupon,
            $request->user()->id,
        );

        DB::transaction(function () use ($order, $data, $package, $coupon, $b) {
            $order->update([
                'package_id' => $package->id,
                'coupon_id' => ($b['coupon_error'] === null && $coupon) ? $coupon->id : null,
                'currency' => $data['currency'] ?? $order->currency,
                'package_price' => $b['package_price'],
                'addons_total' => $b['addons_total'],
                'subtotal' => $b['subtotal'],
                'discount' => $b['discount'],
                'total' => $b['total'],
                'deposit_amount' => $b['deposit_amount'],
                'remaining_amount' => $b['remaining_amount'],
                'project_name' => $data['project_name'] ?? $order->project_name,
                'description' => $data['description'] ?? $order->description,
                'expected_launch_date' => $data['expected_launch_date'] ?? $order->expected_launch_date,
            ]);

            $order->addons()->delete();
            $this->syncAddons($order, $b['addon_lines']);
        });

        return response()->json([
            'order' => $order->fresh()->load('addons.addon'),
            'coupon_error' => $b['coupon_error'],
        ]);
    }

    /**
     * POST /api/v1/orders/calculate — live pricing preview (no persistence).
     */
    public function calculate(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request, requireProject: false);
        $package = Package::findOrFail($data['package_id']);
        $coupon = $this->resolveCoupon($data['coupon_code'] ?? null);

        $b = $this->pricing->breakdown(
            $package,
            $data['addon_ids'] ?? [],
            $data['currency'] ?? 'EGP',
            $coupon,
            $request->user()->id,
        );

        return response()->json($b);
    }

    /**
     * POST /api/v1/orders/{order}/checkout — lock the order for payment.
     * Marks it pending_payment; the actual gateway flow reuses PaymentController.
     */
    public function checkout(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);
        if ($order->status !== Order::STATUS_DRAFT) {
            return response()->json(['message' => 'تم تجهيز هذا الطلب للدفع بالفعل.'], 422);
        }
        if (empty($order->project_name)) {
            return response()->json(['message' => 'أضف اسم المشروع قبل الدفع.'], 422);
        }

        $order->update(['status' => Order::STATUS_PENDING_PAYMENT]);

        return response()->json([
            'order' => $order->fresh(),
            'deposit_amount' => $order->deposit_amount,
            'message' => 'جاهز للدفع',
        ]);
    }

    /**
     * POST /api/v1/orders/{order}/attachments — upload a brief/logo/reference.
     * Mirrors the chat upload's MIME whitelist + filename sanitization.
     */
    public function uploadAttachment(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        $allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip',
        ];

        $request->validate([
            'file' => [
                'required', 'file', 'max:10240', // 10MB
                'mimetypes:' . implode(',', $allowedMimes),
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,zip',
            ],
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();
        abort_unless(in_array($mime, $allowedMimes, true), 422, 'نوع الملف غير مسموح');

        $rawName = $file->getClientOriginalName();
        $safeName = mb_substr(preg_replace('/[\/\\\\\x00-\x1F]/', '_', basename($rawName)), 0, 200);
        $path = $file->store("orders/{$order->id}", 'public');

        $attachment = $order->attachments()->create([
            'filename' => basename($path),
            'original_name' => $safeName,
            'mime_type' => $mime,
            'size' => $file->getSize(),
            'path' => $path,
        ]);

        return response()->json(['attachment' => $attachment], 201);
    }

    // ============================================
    // Helpers
    // ============================================
    private function validatePayload(Request $request, bool $requireProject = false): array
    {
        return $request->validate([
            'package_id' => 'required|integer|exists:packages,id',
            'addon_ids' => 'sometimes|array',
            'addon_ids.*' => 'integer|exists:package_addons,id',
            'currency' => 'sometimes|in:EGP,SAR',
            'coupon_code' => 'sometimes|nullable|string|max:60',
            'project_name' => array_filter([
                $requireProject ? 'required' : 'nullable',
                'string', 'max:200', new MeaningfulText(3, requireMultipleWords: true),
            ]),
            'description' => ['nullable', 'string', 'max:5000', new MeaningfulText(15)],
            'expected_launch_date' => 'sometimes|nullable|date',
        ]);
    }

    private function resolveCoupon(?string $code): ?Coupon
    {
        if (empty($code)) {
            return null;
        }

        return Coupon::where('code', $code)->first();
    }

    private function syncAddons(Order $order, array $addonLines): void
    {
        foreach ($addonLines as $line) {
            $order->addons()->create([
                'package_addon_id' => $line['id'],
                'price' => $line['price'],
            ]);
        }
    }

    private function authorizeOwner(Request $request, Order $order): void
    {
        abort_unless($order->user_id === $request->user()->id, 403, 'غير مصرح.');
    }
}
