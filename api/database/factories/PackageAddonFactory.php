<?php

namespace Database\Factories;

use App\Models\PackageAddon;
use Illuminate\Database\Eloquent\Factories\Factory;

class PackageAddonFactory extends Factory
{
    protected $model = PackageAddon::class;

    public function definition(): array
    {
        return [
            'service_type' => $this->faker->randomElement(['web', 'ecommerce', 'branding', 'marketing', 'any']),
            'name_ar' => $this->faker->words(2, true),
            'name_en' => $this->faker->words(2, true),
            'price_type' => 'fixed',
            'price_egp' => $this->faker->numberBetween(1000, 8000),
            'price_sar' => null,
            'percentage' => null,
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }

    public function percentage(float $pct = 30): static
    {
        return $this->state(fn () => [
            'price_type' => 'percentage',
            'price_egp' => 0,
            'percentage' => $pct,
        ]);
    }
}
