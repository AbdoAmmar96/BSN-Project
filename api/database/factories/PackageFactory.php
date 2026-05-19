<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'service_type' => $this->faker->randomElement(['web', 'ecommerce', 'branding', 'marketing']),
            'name' => $this->faker->words(2, true),
            'price' => $this->faker->numberBetween(1000, 50000),
            'currency' => 'EGP',
            'features' => [$this->faker->sentence(), $this->faker->sentence()],
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }
}
