<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Package;
use App\Services\OrderPricing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly OrderPricing $pricing) {}

    /**
     * POST /api/v1/coupons/validate — check a code against a cart and preview
     * the discount. Returns { valid, discount, message }.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:60',
            'package_id' => 'required|integer|exists:packages,id',
            'addon_ids' => 'sometimes|array',
            'addon_ids.*' => 'integer|exists:package_addons,id',
            'currency' => 'sometimes|in:EGP,SAR',
        ]);

        $coupon = Coupon::where('code', $data['code'])->first();
        if (! $coupon) {
            return response()->json(['valid' => false, 'discount' => 0, 'message' => 'كود غير موجود.'], 200);
        }

        $package = Package::findOrFail($data['package_id']);
        $error = $this->pricing->couponError($coupon, $package, $request->user()->id);

        if ($error !== null) {
            return response()->json(['valid' => false, 'discount' => 0, 'message' => $error], 200);
        }

        $b = $this->pricing->breakdown(
            $package,
            $data['addon_ids'] ?? [],
            $data['currency'] ?? 'EGP',
            $coupon,
            $request->user()->id,
        );

        return response()->json([
            'valid' => true,
            'discount' => $b['discount'],
            'total' => $b['total'],
            'message' => 'تم تطبيق الكوبون.',
        ]);
    }
}
