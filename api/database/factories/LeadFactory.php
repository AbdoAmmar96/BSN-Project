<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        return [
            'lead_number' => 'BSN-LEAD-' . now()->year . '-' . str_pad((string) $this->faker->unique()->numberBetween(1, 99999), 4, '0', STR_PAD_LEFT),
            'user_id' => User::factory(),
            'service_type' => $this->faker->randomElement(['web', 'ecommerce', 'branding', 'marketing', 'other']),
            'status' => Lead::STATUS_NEW,
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'smart_answers' => ['pages' => 'multi', 'language' => 'both'],
            'budget_min_egp' => 20000,
            'budget_max_egp' => 60000,
        ];
    }
}
