<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'discount_type' => 'percentage',
            'discount_value' => $this->faker->randomElement([10, 15, 20]),
            'max_discount_egp' => null,
            'usage_limit' => null,
            'usage_count' => 0,
            'per_user_limit' => 1,
            'applies_to_services' => null,
            'is_active' => true,
            'starts_at' => null,
            'expires_at' => now()->addMonths(3),
        ];
    }

    public function fixed(float $amount = 500): static
    {
        return $this->state(fn () => ['discount_type' => 'fixed', 'discount_value' => $amount]);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['expires_at' => now()->subDay()]);
    }
}
