<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $total = $this->faker->numberBetween(8000, 60000);
        $deposit = round($total * 0.4, 2);

        return [
            'order_number' => 'BSN-ORD-' . now()->year . '-' . str_pad((string) $this->faker->unique()->numberBetween(1, 99999), 4, '0', STR_PAD_LEFT),
            'user_id' => User::factory(),
            'package_id' => Package::factory(),
            'status' => Order::STATUS_DRAFT,
            'currency' => 'EGP',
            'package_price' => $total,
            'addons_total' => 0,
            'subtotal' => $total,
            'discount' => 0,
            'total' => $total,
            'deposit_amount' => $deposit,
            'remaining_amount' => $total - $deposit,
            'project_name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => ['status' => Order::STATUS_PAID, 'paid_at' => now()]);
    }
}
