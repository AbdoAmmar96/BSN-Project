<?php

namespace Database\Factories;

use App\Models\Bundle;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BundleFactory extends Factory
{
    protected $model = Bundle::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'name_ar' => $name,
            'name_en' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 99999),
            'description_ar' => $this->faker->sentence(),
            'discount_type' => 'percentage',
            'discount_value' => $this->faker->randomElement([10, 15, 20]),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }
}
