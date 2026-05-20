<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\Quote;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteFactory extends Factory
{
    protected $model = Quote::class;

    public function definition(): array
    {
        $total = $this->faker->numberBetween(20000, 80000);

        return [
            'quote_number' => 'BSN-QT-' . now()->year . '-' . str_pad((string) $this->faker->unique()->numberBetween(1, 99999), 4, '0', STR_PAD_LEFT),
            'lead_id' => Lead::factory(),
            'version' => 1,
            'status' => Quote::STATUS_DRAFT,
            'currency' => 'EGP',
            'subtotal' => $total,
            'discount' => 0,
            'total' => $total,
            'estimated_days' => $this->faker->numberBetween(20, 60),
            'payment_schedule' => [
                ['percentage' => 40, 'label' => 'عربون'],
                ['percentage' => 30, 'label' => 'بعد التصميم'],
                ['percentage' => 30, 'label' => 'عند التسليم'],
            ],
            'expires_at' => now()->addDays(7),
        ];
    }

    public function sent(): static
    {
        return $this->state(fn () => ['status' => Quote::STATUS_SENT, 'sent_at' => now()]);
    }
}
