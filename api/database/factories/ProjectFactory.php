<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'service_type' => $this->faker->randomElement(['web', 'ecommerce', 'branding', 'marketing']),
            'status' => 'draft',
            'budget' => $this->faker->numberBetween(5000, 80000),
            'paid_amount' => 0,
        ];
    }
}
