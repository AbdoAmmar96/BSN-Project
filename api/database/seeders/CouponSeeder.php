<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'FIRST100',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'max_discount_egp' => 5000,
                'usage_limit' => 100,          // first 100 customers only
                'per_user_limit' => 1,
                'applies_to_services' => null,
                'expires_at' => now()->addYear(),
            ],
            [
                'code' => 'SUMMER2026',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'max_discount_egp' => null,
                'usage_limit' => null,
                'per_user_limit' => 1,
                'applies_to_services' => null,
                'starts_at' => now()->startOfMonth(),
                'expires_at' => now()->addMonths(3),
            ],
            [
                'code' => 'REFERRAL',
                'discount_type' => 'fixed',
                'discount_value' => 1000,
                'usage_limit' => null,
                'per_user_limit' => 3,
                'applies_to_services' => null,
                'expires_at' => now()->addYear(),
            ],
            [
                'code' => 'STUDENT',
                'discount_type' => 'percentage',
                'discount_value' => 20,
                'max_discount_egp' => 3000,
                'usage_limit' => null,
                'per_user_limit' => 1,
                'applies_to_services' => ['web', 'branding'],
                'expires_at' => now()->addYear(),
            ],
        ];

        foreach ($coupons as $c) {
            Coupon::updateOrCreate(['code' => $c['code']], $c);
        }

        $this->command?->info('✓ Seeded ' . count($coupons) . ' coupons');
    }
}
