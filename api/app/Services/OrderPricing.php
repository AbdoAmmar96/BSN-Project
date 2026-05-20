<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Package;
use App\Models\PackageAddon;

/**
 * Single source of truth for order pricing. Given a package, chosen addons,
 * currency, and an optional coupon, returns the full breakdown. Used by both
 * the live "calculate" endpoint and the authoritative checkout path so the
 * client can never dictate the total.
 */
class OrderPricing
{
    public const DEPOSIT_RATE = 0.40;

    /**
     * @param  int[]  $addonIds
     * @return array{package_price:float,addons_total:float,subtotal:float,discount:float,total:float,deposit_amount:float,remaining_amount:float,addon_lines:array,coupon_error:?string}
     */
    public function breakdown(Package $package, array $addonIds, string $currency = 'EGP', ?Coupon $coupon = null, ?int $userId = null): array
    {
        $packagePrice = $package->priceIn($currency);

        $addons = PackageAddon::whereIn('id', $addonIds)
            ->where('is_active', true)
            ->get();

        $addonLines = [];
        $addonsTotal = 0.0;
        foreach ($addons as $addon) {
            $price = $addon->resolvePrice($packagePrice, $currency);
            $addonsTotal += $price;
            $addonLines[] = ['id' => $addon->id, 'name_ar' => $addon->name_ar, 'price' => $price];
        }

        $subtotal = round($packagePrice + $addonsTotal, 2);

        $discount = 0.0;
        $couponError = null;
        if ($coupon) {
            $couponError = $this->couponError($coupon, $package, $userId);
            if ($couponError === null) {
                $discount = $coupon->discountFor($subtotal);
            }
        }

        $total = round($subtotal - $discount, 2);
        $deposit = round($total * self::DEPOSIT_RATE, 2);

        return [
            'package_price' => $packagePrice,
            'addons_total' => round($addonsTotal, 2),
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $total,
            'deposit_amount' => $deposit,
            'remaining_amount' => round($total - $deposit, 2),
            'addon_lines' => $addonLines,
            'coupon_error' => $couponError,
        ];
    }

    /**
     * Returns an Arabic error string if the coupon can't apply, or null if ok.
     */
    public function couponError(Coupon $coupon, Package $package, ?int $userId = null): ?string
    {
        if (! $coupon->isRedeemable()) {
            return 'الكوبون غير صالح أو منتهي.';
        }
        if (! $coupon->appliesToService($package->service_type)) {
            return 'الكوبون لا ينطبق على هذه الخدمة.';
        }
        if ($userId !== null && $coupon->per_user_limit > 0) {
            $usedByUser = $coupon->orders()
                ->where('user_id', $userId)
                ->whereNotIn('status', ['draft', 'cancelled'])
                ->count();
            if ($usedByUser >= $coupon->per_user_limit) {
                return 'وصلت للحد الأقصى لاستخدام هذا الكوبون.';
            }
        }

        return null;
    }
}
